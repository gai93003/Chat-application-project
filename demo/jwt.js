


import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

const user = getUser(username);
const match = await bcrypt.compare(password, user.passwordHash);


app.post("/login", (req, res) => {
  const {username, password} = req.body;

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });  
  res.json({message: "Login successfully", token});
});


function authentication (req, res, next) {
  const authHeader = req.headers["authentication"];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  })
}

app.get("/messages", authentication, (req, res) => {
  res.json(messages);
})

app.post("/messages", authentication, (req, res) => {
  // =====================
})

async function getMessages() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${url}/messages`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
  }
  catch (err) {
    
  }
}