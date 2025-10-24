import * as admin from "firebase-admin";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {logger} from "firebase-functions";

// Initialize the Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

/**
 * Fetches the push token for a given user ID.
 * @param {string} userId The ID of the user.
 * @return {Promise<string | null>} The push token or null if not found.
 */
async function getUserPushToken(userId: string): Promise<string | null> {
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      logger.warn(`User document not found for userId: ${userId}`);
      return null;
    }
    const pushToken = userDoc.data()?.pushToken;
    if (!pushToken) {
      logger.warn(`Push token not found for userId: ${userId}`);
      return null;
    }
    return pushToken;
  } catch (error) {
    logger.error(`Error fetching user push token for ${userId}:`, error);
    return null;
  }
}

/**
 * Cloud Function to send a notification when a user likes a post.
 */
export const sendNotificationOnNewLike = onDocumentCreated(
    "posts/{postId}/likes/{likerId}",
    async (event) => {
      const {postId, likerId} = event.params;

      logger.log(
          `New like from ${likerId} on post ${postId}`,
      );

      // Get the post details to find the author
      const postDoc = await db.collection("posts").doc(postId).get();
      if (!postDoc.exists) {
        logger.error(`Post ${postId} not found.`);
        return;
      }

      const postAuthorId = postDoc.data()?.userId;
      if (!postAuthorId) {
        logger.error(`Author ID not found for post ${postId}.`);
        return;
      }

      // Don't send a notification if users like their own post
      if (postAuthorId === likerId) {
        logger.log("User liked their own post. No notification sent.");
        return;
      }

      // Get the liker's display name
      const likerDoc = await db.collection("users").doc(likerId).get();
      const likerName = likerDoc.data()?.displayName || "Someone";

      // Get the author's push token
      const authorPushToken = await getUserPushToken(postAuthorId);
      if (!authorPushToken) {
        return;
      }

      const payload: admin.messaging.MessagingPayload = {
        notification: {
          title: "New Like on Your Post!",
          body: `${likerName} liked your post.`,
        },
      };

      logger.log("Sending notification payload:", payload);
      await messaging.sendToDevice(authorPushToken, payload);
    });

/**
 * Cloud Function to send a notification when a user comments on a post.
 */
export const sendNotificationOnNewComment = onDocumentCreated(
    "comments/{commentId}",
    async (event) => {
      const snapshot = event.data;
      if (!snapshot) {
        logger.error("No data associated with the event");
        return;
      }
      const commentData = snapshot.data();

      const {postId, userId: commenterId, text} = commentData;
      logger.log(
          `New comment from ${commenterId} on post ${postId}: ${text}`,
      );

      // Get the post details to find the author
      const postDoc = await db.collection("posts").doc(postId).get();
      if (!postDoc.exists) {
        logger.error(`Post ${postId} not found.`);
        return;
      }

      const postAuthorId = postDoc.data()?.userId;
      if (!postAuthorId) {
        logger.error(`Author ID not found for post ${postId}.`);
        return;
      }

      // Don't send a notification if users comment on their own post
      if (postAuthorId === commenterId) {
        logger.log(
            "User commented on their own post. No notification sent.",
        );
        return;
      }

      // Get the commenter's display name
      const commenterDoc = await db.collection("users").doc(commenterId).get();
      const commenterName = commenterDoc.data()?.displayName || "Someone";

      // Get the author's push token
      const authorPushToken = await getUserPushToken(postAuthorId);
      if (!authorPushToken) {
        return;
      }

      const payload: admin.messaging.MessagingPayload = {
        notification: {
          title: "New Comment on Your Post!",
          body: `${commenterName}: "${text.substring(0, 100)}${text.length > 100 ? "..." : ""}"`,
        },
      };

      logger.log("Sending notification payload:", payload);
      await messaging.sendToDevice(authorPushToken, payload);
    });

/**
 * Cloud Function to send a notification when a new post is created.
 */
export const sendNotificationOnNewPost = onDocumentCreated(
    "posts/{postId}",
    async (event) => {
      const snapshot = event.data;
      if (!snapshot) {
        logger.error("No data associated with the event");
        return;
      }
      const postData = snapshot.data();
      const {userId: authorId, text} = postData;

      // Get the author's name
      const authorDoc = await db.collection("users").doc(authorId).get();
      const authorName = authorDoc.data()?.displayName || "Someone";

      // Get all users' push tokens
      const usersSnapshot = await db.collection("users").get();
      const tokens = usersSnapshot.docs
          .map((doc) => doc.data().pushToken)
          .filter((token) => token);

      if (tokens.length === 0) {
        logger.log("No push tokens found to send notifications.");
        return;
      }

      const payload: admin.messaging.MessagingPayload = {
        notification: {
          title: "New Post!",
          body: `${authorName} has created a new post: "${text.substring(0, 100)}${text.length > 100 ? "..." : ""}"`,
        },
      };

      logger.log("Sending notification to all users:", payload);
      await messaging.sendToDevice(tokens, payload);
    });