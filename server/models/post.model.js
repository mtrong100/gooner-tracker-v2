import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    dateTime: { type: Date, required: true },
    description: { type: String, required: true },
    duration: { type: String, required: true },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
