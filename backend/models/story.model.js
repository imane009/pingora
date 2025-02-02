import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      type: String,
      required: function() {
        return !this.video;  // Si vidéo est vide, image doit être fournie
      },
    },
    video: {
      type: String,
      required: function() {
        return !this.image;  // Si image est vide, vidéo doit être fournie
      },
    },
    likes: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        likedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    viewers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 24, // Expiration après 24 heures
    },
  },
  {
    timestamps: true,
  }
);



const Story = mongoose.model("Story", storySchema);

export default Story;
