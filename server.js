require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");

const path = require("path");

const Comments = require("./models/commentModel");
const Users = require("./models/userModel");
const Logs = require("./models/logModel");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "https://kltn-bookstore-website.vercel.app",
      "https://kltn-book-store-website.vercel.app",
    ],
  })
);
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:3000",
    "https://kltn-bookstore-website.vercel.app",
    "http://kltn-e-commerce-be.vercel.app",
    "https://kltn-book-store-website.vercel.app",
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  //res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8020');
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", true);
  return next();
});
app.use(
  fileUpload({
    useTempFiles: true,
  })
);
app.get("/", (req, res) => {
  res.json({ msg: "Hello, Book Store Chuangg!" });
});
//socket
const http = require("http").createServer(app);
const io = require("socket.io")(http);

//Routes
app.use("/user", require("./routes/userRouter"));
app.use("/api", require("./routes/discountRouter"));
app.use("/api", require("./routes/categoryRouter"));
app.use("/api", require("./routes/uploadImg"));
app.use("/api", require("./routes/productRouter"));
app.use("/api", require("./routes/orderRouter"));
app.use("/api", require("./routes/commentRouter"));
app.use("/api", require("./routes/analyticRouter"));
app.use("/api", require("./routes/logRouter"));

//Connet SocketIO
let users = [];

let onlineUsers = [];
const addNewUser = (newUser, socketId) => {
  if (!onlineUsers.some((user) => user.id === newUser.id)) {
    onlineUsers.push({ ...newUser, socketId });
  } else {
    onlineUsers = onlineUsers.filter((user) => user.id !== newUser.id);

    onlineUsers.push({ ...newUser, socketId });
  }

  // const check = onlineUsers.every((onlUser) => onlUser.socketId !== socketId);
  // if (check) {
  //   onlineUsers.push({ ...newUser, socketId });
  // }
};
const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};
const getAdmin = () => {
  return onlineUsers.find((user) => user.role === "admin");
};

const johnRoomAdmin = () => {};

io.on("connection", (socket) => {
  console.log(socket.id + " connected.");
  // isAccessing on Web
  socket.on("newUser", async (user) => {
    const account = await Users.findById(user.id).select("_id name role");
    const newUser = {
      id: account._id.toString(),
      name: account.name,
      role: account.role === 1 ? "admin" : "user",
      room: account.role === 1 ? "admin-r1" : undefined,
    };

    addNewUser(newUser, socket.id);
    if (newUser.role === "admin") {
      socket.join("admin-r1");
    }
    console.log(onlineUsers);
  });

  // Listen Notification
  socket.on(
    "sendNotificationRating",
    async ({ senderType, senderUser, senderData, senderTime, senderObj }) => {
      const receiveAdmin = getAdmin();

      const senderBy = {
        ...senderUser,
        role: receiveAdmin.role,
      };
      const newLog = new Logs({
        logType: senderType,
        logBy: senderBy,
        logAction: senderData,
        logObject: senderObj,
        createdAt: senderTime,
      });
      await newLog.save();
      io.to("admin-r1").emit("getNotification-admin", newLog);
    }
  );

  //JoinRoom
  socket.on("johnBookDetail", (id) => {
    const user = { userId: socket.id, room: id };

    //check
    const check = users.every((user) => user.userId !== socket.id);
    if (check) {
      users.push(user);
      socket.join(user.room);
    } else {
      users.map((user) => {
        if (user.userId === socket.id) {
          if (user.room !== id) {
            socket.leave(user.room);
            socket.join(id);
            user.room = id;
          }
        }
      });
    }
    // console.log(users)
    // console.log(socket.adapter.rooms)
  });

  socket.on("createComment", async (msg) => {
    const {
      username,
      content,
      product_id,
      createdAt,
      rating,
      send,
      idComment,
    } = msg;
    const newComment = new Comments({
      username,
      content,
      product_id,
      createdAt,
      rating,
    });

    if (send === "replyComment") {
      const { username, content, product_id, createdAt } = newComment;
      const comment = await Comments.findById(idComment);
      if (comment) {
        comment.reply.push({ username, content, createdAt });

        await comment.save();
        const commentRes = await Comments.findById(idComment);
        io.to(comment.product_id).emit("sendReplyCommentToClient", commentRes);
      }
    } else {
      await newComment.save();
      io.to(newComment.product_id).emit("sendCommentToClient", newComment);
    }
  });

  socket.on("disconnect ", () => {
    console.log(socket.id + " disconnected.");
    socket.leave("admin-r1");
    removeUser(socket.id);
  });
});
//Connect to database (mongodb)
const URI = process.env.MONGODB_URL;
mongoose.connect(URI, (err) => {
  if (err) throw err;
  console.log("Connect to MongoDB success");
});

// Test connect to db
// app.get("/", (req, res) => {
//   res.json({ msg: "Welcome my bookstore CHUANG CHUANG" });
// });

const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
  console.log("Server is running on port:", PORT);
});

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static("client/build"));
//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "client", "build", "index.html"));
//   });
// }
