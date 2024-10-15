require('newrelic'); // Importer l'agent New Relic en premier
require("dotenv").config();
const mongoose = require("mongoose");
const User = require('./models/User');
const Message = require('./models/Message');
const jwt = require('jsonwebtoken');
const app = require('./app');

// Connexion à MongoDB
mongoose.connect(process.env.DATABASE);

mongoose.connection.on("error", (err) => {
    console.log("Mongoose Connection Error: ", err);
});

mongoose.connection.once("open", () => {
    console.log("MongoDB Connected!");
});

// Démarrer le serveur
const server = app.listen(8000, () => {
    console.log("Server listening on port 8000");
});

// Socket.io configuration
const io = require("socket.io")(server);

io.use(async (socket, next) => {
    try {
        const token = socket.handshake.query.token;
        console.log("Token received: ", token);

        // Vérification du token
        const payload = jwt.verify(token, process.env.SECRET);
        socket.userId = payload.id; // Stocker l'id utilisateur dans le socket
        next();
    } catch (err) {
        console.log("JWT Verification Error: ", err);
        next(new Error('Authentication error'));
    }
});

// Gestion des événements socket
io.on('connection', (socket) => {
    console.log("Connected: " + socket.userId);

    socket.on('disconnect', async () => {
        if (socket.userId) {
            console.log("Disconnected: " + socket.userId);
            const user = await User.findById(socket.userId);
            if (user) {
                io.emit("userDisconnected", { userId: socket.userId, userName: user.name });
            }
        }
    });

    socket.on("joinRoom", async ({ chatroomId }) => {
        socket.join(chatroomId);
        console.log("A user joined chatroom: " + chatroomId);
        
        const user = await User.findById(socket.userId);
        if (user) {
            socket.emit("userConnected", { _id: user._id, name: user.name });
        }

        const messages = await Message.find({ chatroom: chatroomId })
            .sort({ createdAt: 1 })
            .populate('user', 'name');
        socket.emit('previousMessages', messages);
    });

    socket.on("leaveRoom", ({ chatroomId }) => {
        socket.leave(chatroomId);
        console.log("A user left chatroom: " + chatroomId);
    });

    socket.on("chatroomMessage", async ({ chatroomId, message }) => {
        if (message.trim().length > 0) {
            const user = await User.findById(socket.userId);
            if (!user) {
                console.log("User not found");
                return;
            }

            const newMessage = new Message({
                chatroom: chatroomId,
                user: socket.userId,
                message,
            });

            await newMessage.save();

            io.to(chatroomId).emit("newMessage", {
                message,
                user: {
                    _id: socket.userId,
                    name: user.name,
                },
            });
        }
    });
});
