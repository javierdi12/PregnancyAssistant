import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { doc, onSnapshot, collection, query, where, orderBy, Timestamp, addDoc, serverTimestamp, updateDoc, increment, deleteDoc, setDoc, getDoc, writeBatch, getDocs } from 'firebase/firestore';
import { db, auth } from '../../../FireBase'; // Adjust path as needed
import { useThemeColor } from '@/hooks/useThemeColor';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { timeAgo } from '../../../utils/time';
import { Feather } from '@expo/vector-icons';

interface Post {
  id: string;
  userId: string;
  text: string;
  imageUrl?: string;
  createdAt: Timestamp;
  likesCount: number;
  commentsCount: number;
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  text: string;
  createdAt: Timestamp;
}

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [postAuthor, setPostAuthor] = useState<string | null>(null);
  const [commentAuthors, setCommentAuthors] = useState<Record<string, string>>({});
  const [editingComment, setEditingComment] = useState<{ id: string; text: string } | null>(null);
  const [editingPost, setEditingPost] = useState<{ id: string; text: string } | null>(null);

  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const dangerColor = useThemeColor({}, 'danger');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'icon');

  useEffect(() => {
    if (!postId || typeof postId !== 'string') {
      setError("ID de publicación no válido.");
      setLoading(false);
      return;
    }

    // --- Fetch Post ---
    const postRef = doc(db, 'posts', postId);
    const unsubscribePost = onSnapshot(postRef, async (docSnap) => {
      if (docSnap.exists()) {
        const postData = { id: docSnap.id, ...docSnap.data() } as Post;
        setPost(postData);

        // Fetch author
        if (postData.userId) {
          const userRef = doc(db, 'users', postData.userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setPostAuthor(userSnap.data().displayName || 'Usuario Anónimo');
          } else {
            setPostAuthor('Usuario Anónimo');
          }
        }
      } else {
        setError("No se encontró la publicación.");
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching post:", err);
      setError("Error al cargar la publicación.");
      setLoading(false);
    });

    // --- Fetch Comments ---
    const commentsColRef = collection(db, 'comments');
    const q = query(commentsColRef, where('postId', '==', postId), orderBy('createdAt', 'asc'));
    const unsubscribeComments = onSnapshot(q, async (querySnapshot) => {
      const fetchedComments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
      setComments(fetchedComments);

      // Fetch comment authors
      if (fetchedComments.length > 0) {
        const userIds = [...new Set(fetchedComments.map(c => c.userId))];
        const newCommentAuthors: Record<string, string> = {};
        for (const userId of userIds) {
          const userRef = doc(db, 'users', userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            newCommentAuthors[userId] = userSnap.data().displayName || 'Usuario Anónimo';
          } else {
            newCommentAuthors[userId] = 'Usuario Anónimo';
          }
        }
        setCommentAuthors(prev => ({ ...prev, ...newCommentAuthors }));
      }
    }, (err) => {
      console.error("Error fetching comments:", err);
      setError("Error al cargar los comentarios.");
    });

    // --- Check Like Status ---
    let unsubscribeLike: (() => void) | undefined;
    if (auth.currentUser) {
      const likeRef = doc(db, 'posts', postId, 'likes', auth.currentUser.uid);
      unsubscribeLike = onSnapshot(likeRef, (docSnap) => {
        setIsLiked(docSnap.exists());
      });
    }

    return () => {
      unsubscribePost();
      unsubscribeComments();
      if (unsubscribeLike) {
        unsubscribeLike();
      }
    };
  }, [postId, auth.currentUser]); // Add auth.currentUser to dependency array

  const handleLikeToggle = async () => {
    if (!auth.currentUser || !postId || typeof postId !== 'string') {
      Alert.alert('Error', 'Debes iniciar sesión para dar "Me gusta".');
      return;
    }

    const postRef = doc(db, 'posts', postId);
    const likeRef = doc(db, 'posts', postId, 'likes', auth.currentUser.uid);

    try {
      if (isLiked) {
        // Unlike
        await deleteDoc(likeRef);
        await updateDoc(postRef, {
          likesCount: increment(-1)
        });
      } else {
        // Like
        await setDoc(likeRef, { likedAt: serverTimestamp() });
        await updateDoc(postRef, {
          likesCount: increment(1)
        });
      }
    } catch (error) {
      console.error("Error toggling like: ", error);
      Alert.alert('Error', 'Hubo un problema al procesar tu "Me gusta".');
    }
  };

  const handleAddComment = async () => {
    if (!newCommentText.trim()) {
      Alert.alert('Error', 'El comentario no puede estar vacío.');
      return;
    }
    if (!auth.currentUser) {
      Alert.alert('Error', 'Debes iniciar sesión para comentar.');
      return;
    }
    if (!post || !postId || typeof postId !== 'string') {
      Alert.alert('Error', 'No se puede añadir un comentario a esta publicación.');
      return;
    }

    try {
      // 1. Add the new comment
      await addDoc(collection(db, 'comments'), {
        postId: postId,
        text: newCommentText,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });

      // 2. Update the comments count on the post
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        commentsCount: increment(1)
      });

      // Clear the input field
      setNewCommentText('');

    } catch (error) {
      console.error("Error adding comment: ", error);
      Alert.alert('Error', 'Hubo un problema al publicar tu comentario.');
    }
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert(
      "Eliminar Comentario",
      "¿Estás seguro de que quieres eliminar este comentario?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              // 1. Delete the comment document
              await deleteDoc(doc(db, "comments", commentId));

              // 2. Decrement the comments count on the post
              if (postId && typeof postId === 'string') {
                const postRef = doc(db, "posts", postId);
                await updateDoc(postRef, {
                  commentsCount: increment(-1)
                });
              }
            } catch (error) {
              console.error("Error deleting comment: ", error);
              Alert.alert("Error", "Hubo un problema al eliminar el comentario.");
            }
          },
        },
      ]
    );
  };

  const handleDeletePost = () => {
    if (!post || !postId || typeof postId !== 'string') return;

    Alert.alert(
      "Eliminar Publicación",
      "¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer y eliminará todos los comentarios y \"Me gusta\" asociados.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              // 1. Delete all comments
              const commentsQuery = query(collection(db, "comments"), where("postId", "==", postId));
              const commentsSnapshot = await getDocs(commentsQuery);
              const batch = writeBatch(db);
              commentsSnapshot.forEach(doc => {
                batch.delete(doc.ref);
              });
              await batch.commit();

              // 2. Delete all likes
              const likesQuery = query(collection(db, "posts", postId, "likes"));
              const likesSnapshot = await getDocs(likesQuery);
              const likesBatch = writeBatch(db);
              likesSnapshot.forEach(doc => {
                likesBatch.delete(doc.ref);
              });
              await likesBatch.commit();

              // 3. Delete image from storage
              if (post.imageUrl) {
                const storage = getStorage();
                const imageRef = ref(storage, post.imageUrl);
                await deleteObject(imageRef);
              }

              // 4. Delete the post
              await deleteDoc(doc(db, "posts", postId));

              router.back();
            } catch (error) {
              console.error("Error deleting post: ", error);
              Alert.alert("Error", "Hubo un problema al eliminar la publicación.");
            }
          },
        },
      ]
    );
  };

  const handleUpdateComment = async () => {
    if (!editingComment) return;
    try {
      const commentRef = doc(db, 'comments', editingComment.id);
      await updateDoc(commentRef, { text: editingComment.text });
      setEditingComment(null);
    } catch (error) {
      console.error("Error updating comment: ", error);
      Alert.alert("Error", "Hubo un problema al actualizar el comentario.");
    }
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;
    try {
      const postRef = doc(db, 'posts', editingPost.id);
      await updateDoc(postRef, { text: editingPost.text });
      setEditingPost(null);
    } catch (error) {
      console.error("Error updating post: ", error);
      Alert.alert("Error", "Hubo un problema al actualizar la publicación.");
    }
  };

  const showPostActions = () => {
    if (!post) return;
    Alert.alert(
      "Acciones de la Publicación",
      "Elige una opción",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Editar",
          onPress: () => setEditingPost({ id: post.id, text: post.text }),
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: handleDeletePost,
        },
      ]
    );
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const isAuthor = auth.currentUser?.uid === item.userId;

    const showCommentActions = () => {
      Alert.alert(
        "Acciones",
        "Elige una opción",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Editar", 
            onPress: () => setEditingComment({ id: item.id, text: item.text }) 
          },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => handleDeleteComment(item.id),
          },
        ]
      );
    };

    return (
      <View style={[styles.commentItem, { backgroundColor: cardColor, borderColor: borderColor }]}>
        <View style={styles.commentHeader}>
          <ThemedText type="subtitle">{commentAuthors[item.userId] || 'Cargando...'}</ThemedText>
          {isAuthor && (
            <TouchableOpacity onPress={showCommentActions}>
              <Feather name="more-horizontal" size={20} color={iconColor} />
            </TouchableOpacity>
          )}
        </View>
        <ThemedText>{item.text}</ThemedText>
        <ThemedText style={[styles.commentTimestamp, { color: iconColor }]}>{timeAgo(item.createdAt)}</ThemedText>
      </View>
    );
  };

  if (loading) {
    return (
      <ThemedView style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText>Cargando publicación...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.loadingContainer, { backgroundColor }]}>
        <ThemedText type="subtitle">{error}</ThemedText>
      </ThemedView>
    );
  }

  if (!post) {
    // This case is mostly covered by the error state, but it's a good fallback.
    return (
      <ThemedView style={[styles.loadingContainer, { backgroundColor }]}>
        <ThemedText>No se encontró la publicación.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: 'Publicación' }} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={90} // Adjust this value as needed
      >
        <FlatList
          ListHeaderComponent={() => {
            const isPostAuthor = auth.currentUser?.uid === post.userId;
            return (
              <View style={[styles.postContainer, { backgroundColor: cardColor, borderColor: borderColor }]}>
                <View style={styles.postHeader}>
                  <ThemedText type="subtitle">{postAuthor || 'Cargando...'}</ThemedText>
                  {isPostAuthor && (
                    <TouchableOpacity onPress={showPostActions}>
                      <Feather name="more-horizontal" size={20} color={iconColor} />
                    </TouchableOpacity>
                  )}
                </View>
                <ThemedText style={styles.postText}>{post.text}</ThemedText>
                {post.imageUrl && <Image source={{ uri: post.imageUrl }} style={styles.postImage} />}
                <View style={[styles.postActions, { borderTopColor: borderColor }]}>
                  <TouchableOpacity onPress={handleLikeToggle} style={styles.actionButton}>
                    <ThemedText style={{ color: isLiked ? dangerColor : iconColor }}>❤️ {post.likesCount}</ThemedText>
                  </TouchableOpacity>
                  <ThemedText style={styles.actionButton}>💬 {post.commentsCount}</ThemedText>
                </View>
                <ThemedText style={[styles.postTimestamp, { color: iconColor }]}>
                  {timeAgo(post.createdAt)}
                </ThemedText>
                <ThemedText type="subtitle" style={[styles.commentsTitle, { borderTopColor: borderColor, color: tintColor }]}>Comentarios</ThemedText>
              </View>
            );
          }}
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
        <View style={[styles.commentInputContainer, { backgroundColor: backgroundColor, borderTopColor: borderColor }]}>
          <TextInput
            style={[styles.commentInput, { borderColor: borderColor, color: textColor }]}
            placeholder="Añadir un comentario..."
            value={newCommentText}
            onChangeText={setNewCommentText}
            placeholderTextColor={placeholderColor}
          />
          <TouchableOpacity style={[styles.sendButton, { backgroundColor: tintColor }]} onPress={handleAddComment}>
            <Feather name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Edit Comment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editingComment !== null}
        onRequestClose={() => setEditingComment(null)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalView, { backgroundColor: cardColor }]}>
            <ThemedText type="subtitle">Editar Comentario</ThemedText>
            <TextInput
              style={[styles.textInput, { borderColor: borderColor, color: textColor, height: 100 }]}
              value={editingComment?.text}
              onChangeText={(text) => setEditingComment(prev => prev ? { ...prev, text } : null)}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: tintColor }]}
                onPress={handleUpdateComment}
              >
                <ThemedText style={styles.buttonText}>Guardar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: dangerColor }]}
                onPress={() => setEditingPost(null)}
              >
                <ThemedText style={styles.buttonText}>Cancelar</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Post Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editingPost !== null}
        onRequestClose={() => setEditingPost(null)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalView, { backgroundColor: cardColor }]}>
            <ThemedText type="subtitle">Editar Publicación</ThemedText>
            <TextInput
              style={[styles.textInput, { borderColor: borderColor, color: textColor, height: 100 }]}
              value={editingPost?.text}
              onChangeText={(text) => setEditingPost(prev => prev ? { ...prev, text } : null)}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: tintColor }]} 
                onPress={handleUpdatePost}
              >
                <ThemedText style={styles.buttonText}>Guardar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: dangerColor }]} 
                onPress={() => setEditingPost(null)}
              >
                <ThemedText style={styles.buttonText}>Cancelar</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  postContainer: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  postText: {
    marginBottom: 10,
    fontSize: 16,
    lineHeight: 24,
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginTop: 10,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  actionButton: {
    paddingHorizontal: 10,
  },
  postTimestamp: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'right',
  },
  commentsTitle: {
    marginTop: 20,
    marginBottom: 10,
    borderTopWidth: 1,
    paddingTop: 10,
    fontSize: 20,
    fontWeight: 'bold',
  },
  commentItem: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentTimestamp: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    marginBottom: 20,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  sendButton: {
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    width: '40%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textInput: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },
});
