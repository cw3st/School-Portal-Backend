require("dotenv").config();

const port = 5000;
const express = require("express");
const mongoose = require("mongoose");
const Users = require("./model/Users");
const school = require("express")();
const bcrypt = require("bcryptjs");
const http = require("http").createServer(school);
const sp = "mongodb+srv://cecdev28:cecschoolportal@cluster0.n0e1q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { verify } = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multerError = require("./handleError");

school.use(multerError);

const connectionparams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const corsOption = {
  credentials: true,
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST"],
  optionSucessStatus: 200,
};
school.use(cors(corsOption));
school.use(cookieParser());

school.use(express.json());
school.use(express.urlencoded({ extended: true }));

const validateToken = async (req, res, next) => {
  let usersToken =
    req.headers["x-access-token"] ||
    req.cookies.soks ||
    req.headers["authorization"];

  if (!usersToken) {
    return res.status(405).json({ message: "No auth found" });
  }

  // If Authorization header exists, extract token after "Bearer"
  if (usersToken.startsWith("Bearer ")) {
    usersToken = usersToken.split(" ")[1];
  }

  try {
    verify(usersToken, "ACCESS_TOKEN_SECRET", (err, decoded) => {
      if (err) {
        console.error(err);
        return res.status(403).json({ message: "Invalid token" });
      }
      req.decoded = decoded; // Attach decoded token payload to request
      next();
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error validating token" });
  }
};
// const validatedToken = async (req, res, next) => {
//   const usersToken =
//     req.headers["x-access-token"] ||
//     req.cookies.soks ||
//     req.headers["authorization"];

//   if (!usersToken) return res.status(405).json({ message: "No auth found" });

//   try {
//     verify(usersToken, "ACCESS_TOKEN_SECRET", (err, decoded) => {
//       if (err) {
//         console.error(err);
//         return res.status(403).json({ message: "Invalid token" });
//       }
//       req.decoded = decoded;
//       next();
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Error validating token" });
//   }
// };

// school.post("/image", upload, async (req,res)=>{
// try{
//   const update= Users.findOne({email: "wesleyking@gmail.com"})

//   try {
//     const update= await Users.updateOne(
//       {email:"wesleyking@gmail.com"},
//       {$set: {role: req.file.path}}
//     )

//     if(update){
//       return res.status(200).send("sucess")
//     }

//   } catch (error) {

//   }

//  return res.status(200).send({ message: "sucess" });

// } catch (error) {
//   console.error(error);
//   return res.status(400).json({ message: "Error" });
// }
// })

school.post("/register", async (req, res) => {
  const { name, email, regNum, role, password, confirmPassword } = req.body;

  try {
    const userExists = await Users.findOne({ email });

    if (userExists) {
      return res.status(400).send("User already exists");
    }

    const regNumExists = await Users.findOne({ regNum });

    if (regNumExists) {
      return res.status(400).send("registration number already exists");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = new Users({
      name,
      email,
      regNum,
      role,
      password: hashPassword,
      confirmPassword,
    });

    if (password !== confirmPassword) {
      return res.status(400).send("password does not match");
    }

    await user.save();

    return res.status(200).send("User created sucessfully");
  } catch (error) {
    console.error("Error registering user", error);
    return res.status(500).send("Error registering user");
  }
});

school.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Users.findOne({ email });
    if (!user) return res.status(400).send("User not found");

    console.log(user);

    const { name, regNum, _id: id } = user;

    console.log(name, regNum, id)

    const passkey = await bcrypt.compare(password, user.password);
    console.log(passkey);

    if (!passkey) return res.status(400).send("Not allowed");

    const genToken = await jwt.sign(
      {
        email,
        name,
        regNum,
        id,
      },
      "ACCESS_TOKEN_SECRET",
      { expiresIn: "1d" }
    );
    if (!genToken) return res.send("No access token generated");
    console.log(genToken);

    res.cookie("soks", genToken, { path: "/" });

    return res.status(200).json({user: user, token: genToken})
  } catch (error) {
    console.log(error);
    res.clearCookie("soks");
    return res.status(500).send("error");
  }
});

school.get("/logout", async (req, res, next) => {
  if (req.cookies?.soks) {
    res.clearCookie("soks");
    res.status(203).send("ok");
  } else {
    res.clearCookie("soks");
    res.status(203).send("ok");
  }
  next();
});

school.get("/me", validateToken, async (req, res) => {
  let token =
    req.cookies.soks ||
    req.headers["x-access-token"] ||
    req.headers["authorization"];

  if (!token) {
    return res
      .status(400)
      .send("You cannot perform any activities until you are logged in");
  }

  // Extract token from "Bearer <token>"
  if (token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }

  verify(token, "ACCESS_TOKEN_SECRET", async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    } else {
      req.decoded = decoded;

      try {
        const user = await Users.findOne({email: req.decoded.email}).select(
          "-password -confirmPassword"
        );
        if (user) {
          return res.send(user);
        } else {
          return res.status(403).send("Unable to fetch your requested data");
        }
      } catch (err) {
        return res.status(403).send("Unable to fetch your requested data");
      }
    }
  });
});

school.post("/addinfo", async (req, res) => {
  try {
    const update = await Users.findOne({ email: "wesleyking@gmail.com" });
    console.log(update);

    try {
      const success = await update.updateOne({
         shade: 200,
         take: "paper",
         
      });

      if (success) {
        return res.status(200).send("sucess");
      }
    } catch (error) {
      console.log(error)
    }

    return res.status(400).send({ message: "error" });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Error" });
  }
});

school.post("/moreinfo", async (req, res) => {
  try {
    const update = Users.findOne({ email: "wesleyking@gmail.com" });
    console.log(update);

    try {
      const sucess = await update.updateOne({
        currentLevel: 300,
        gpa: 4.9,
      });

      if (sucess) {
        return res.status(200).send("sucess");
      }
    } catch (error) {}

    return res.status(200).send({ message: "sucess" });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Error" });
  }
});

school.post("/create-wes", (req, res) => {
  const {
    department,
    course1,
    course2,
    course3,
    course4,
    registered,
    result1,
    result2,
    result3,
    result4,
    notRegistered,
    paid,
    notPaid,
  } = req.body;

  try {
    const saveUser = new Users({
      department,
      course1,
      course2,
      course3,
      course4,
      registered,
      result1,
      result2,
      result3,
      result4,
      notRegistered,
      paid,
      notPaid,
    });
    saveUser.save();

    if (saveUser) {
      return res.status(200).send("sucessfully taken");
    }
  } catch (error) {
    console.log("error");
    return res.status(404).send("error");
  }
});

// school.get("/more", validatedToken, async (req, res) => {

//   var token =
//     req.headers["x-access-token"] ||
//     req.cookies.soks ||
//     req.headers["authorization"];

//   if (!token) {
//     return res
//       .status(400)
//       .send("You cannot perform any activities until you are logged in");
//   }

//   verify(token, "ACCESS_TOKEN_SECRET", async (err, decoded) => {
//     if (err) {
//       return res.status(403).json({ message: "inavlid token" });
//     } else {
//       req.decoded = decoded;

//       try {
//         const userd = await Wes.findById(req.decoded._id);
//         console.log(userd);
//         if (userd) {
//           return res.send(userd);
//         } else {
//           return res.status(403).send("Unable to fetch your requested data");
//         }
//       } catch (err) {
//         return res.status(403).send("Unable to fetch your requested data");
//       }
//     }
//   });
// });

school.get("/get-wes", async (req, res) => {
  const getAll = await Users.find();
  return res.status(200).send(getAll);
});

mongoose
  .connect(sp, connectionparams)
  .then((result) => {
    console.log("sucessfully connected");
  })
  .catch((error) => {
    console.log("error");
  });

http.listen(port, () => {
  console.log("server connected");
});
