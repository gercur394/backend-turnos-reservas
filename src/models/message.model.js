import mongoose from 'mongoose';

// Esta es una propuesta simple:
// quién envía el mensaje y el texto.
const messageSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    message: { type: String, required: true },
  },
  {
    versionKey: false,
    // Guarda automáticamente cuándo se creó (createdAt) y modificó (updatedAt) cada mensaje
    timestamps: true,
  }
);

const MessageModel = mongoose.model('Message', messageSchema);

export default MessageModel;