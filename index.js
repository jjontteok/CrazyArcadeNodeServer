const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();

app.use(cors()); //모든 도메인에서 요청 허용
app.use(express.json()); //클라이언트에서 보낸 json 본문을 req.body로 읽을 수 있도록 설정

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "ehfkdpahd12@", //내 mysql 비번
  database: "crazy_arcade",
});

//회원가입 API
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: "아이디 또는 비밀 번호 누락" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (username, password) VALUES(?, ?)";

    db.query(sql, [username, hashedPassword], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res
            .status(409)
            .json({ success: false, message: "중복 아이디" });
        }
        return res.status(500).json({ success: false, message: "서버 오류" });
      }
      console.log(`username : ${username}, password : ${password}`);
      return res.json({ success: true, message: "회원가입 성공" });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "비밀번호 암호화 실패" });
  }
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res
      .status(400)
      .json({ success: false, message: "아이디 또는 비밀번호 누락" });

  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], async (err, results) => {
    if (err)
      return res.status(500).json({ success: false, message: "서버 오류" });
    if (results.length === 0)
      return res
        .status(401)
        .json({ success: false, message: "존재하지 않는 아이디입니다." });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "비밀번호 틀림" });
    }
    res.json({ success: true, message: "로그인 성공", user_id: user.user_id });
  });
});

//서버실행
app.listen(3000, () => {
  console.log("Crazy Arcade Node server running at http://localhost:3000");
});
