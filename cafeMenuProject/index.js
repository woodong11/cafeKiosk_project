const express = require("express");
const {pool} = require("./db");

const app = express();
const PORT = 8080;

const cors =  require("cors");
app.use(cors());

const morgan =  require("morgan");
app.use(morgan("dev"));

app.use(express.json());
app.use("/public", express.static("public"));

// menu get 구현 - 첫번째 파라미터는 api 주소
app.get("/api/menus", async(req, res) => {      
    try{
        const data = await pool.query("SELECT * FROM menus");
        return res.json(data[0]);   // db 정보 말고 테이블만 가져오기 위해
    } catch(error){
        return res.json({
            success: false,
            message: "전체 메뉴 목록 조회에 실패하였습니다."
        });
    }
});


// 원하는 id만 검색하도록 구현
app.get("/api/menus/:id", async(req, res) => {      
    try{
        // [req.params.id] 이 ?에 들어간다. 백틱으로 구현해도 된다.
        const data = await pool.query("SELECT * FROM menus WHERE id = ?", [req.params.id]); 
        console.log(data[0]);
        return res.json(data[0][0]);   // data[0] 에서 [0]번째 가져오기 위해
    } catch(error){
        return res.json({
            success: false,
            message: "해당 메뉴 조회에 실패하였습니다."
        });
    }
});


// JSON 넣는거 업데이트 구현 - 예시: {name: "ㅇㅇㅇ" , description: "ㅇㅇㅇ" }
app.patch("/api/menus/:id", async(req, res) => {      
    try{
        // 업데이트 할때는 id를 넣어준다! 에러 방지
        const data = await pool.query("UPDATE menus SET name = ?, description =? where id = ?",
         [req.body.name, req.body.description, req.params.id]); 
       
        return res.json({
            success: true,
            message: "메뉴 정보 수정에 성공하였습니다."
        });   
    } catch(error){
        return res.json({
            success: false,
            message: "메뉴 정보 수정에 실패하였습니다."
        });
    }
});


// POST로 파일 올리기 구현
const path = require("path");
const multer = require("multer");
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, done) => {
            done(null, "public/");
        },
        filename: (req, file, done) =>{

            const ext = path.extname(file.originalname);    // 확장자 뽑기

            const fileNameExeptExt = path.basename(file.originalname, ext); // 저장되는 이름

            const saveFileName = fileNameExeptExt + Date.now() + ext;       // 파일을 올린 시간을 기록하게 된다.
            done(null, saveFileName);   // cat + 2024... + jpg 식으로 저장된다.
        },
    }),
    limits: {fileSize: 5 * 1024 * 1024},
});


app.post("/api/menus", upload.single('file'), async(req, res) => {      
    try{

        console.log(req.body);
        const data = await pool.query(`INSERT INTO menus (name, description, img_src)
         VALUES (?, ?, ?)`, [req.body.name, req.body.description, req.file.path]);

        return res.json({
            success: true,
            message: "메뉴 등록에 성공하였습니다."
        });   
    } catch(error){
        return res.json({
            success: false,
            message: "메뉴 등록에 실패하였습니다."
        });
    }
});

// 이미지 변경하기
app.post("/api/menus/:id/image", upload.single('file'), async(req, res) => {      
    try{
        console.log(req.body);
        const data = await pool.query(`UPDATE menus SET img_src = ? where id = ?`, 
        [req.file.path, req.params.id]);

        return res.json({
            success: true,
            message: "이미지 등록에 성공하였습니다."
        });   
    } catch(error){
        return res.json({
            success: false,
            message: "이미지 등록에 실패하였습니다."
        });
    }
});


// 이미지 삭제하기
app.delete("/api/menus/:id", async(req, res) => {      
    try{
        const data = await pool.query(`DELETE from menus where id = ?`, 
        [req.params.id]);

        return res.json({
            success: true,
            message: "메뉴 삭제에 성공하였습니다."
        });   
    } catch(error){
        return res.json({
            success: false,
            message: "메뉴 삭제에 실패하였습니다."
        });
    }
});


app.delete("/api/menus/:id/image", upload.single('file'), async(req, res) => {      
    try{
        console.log(req.body);
        const data = await pool.query(`DELETE from menus where id = ?`, 
        [req.params.id]);

        return res.json({
            success: true,
            message: "메뉴 삭제에 성공하였습니다."
        });   
    } catch(error){
        return res.json({
            success: false,
            message: "메뉴 삭제에 실패하였습니다."
        });
    }
});






///////////// orders ///////////////////
// orders를 검색해도 메뉴가 나올 수 있도록 join을 해준다.
app.get("/api/orders", async(req, res) => {      
    try{
        // 메뉴 컬럼과 오더 컬럼 한번에 표시
        const data = await pool.query(`SELECT a.id, quantity, request_detail, name, description, img_src  
        FROM orders as a 
        INNER JOIN menus as b 
        ON a.menus_id = b.id 
        ORDER BY a.id DESC
        `);                         // order를 a라고 부르고, menus를 b라고 부른다
        return res.json(data[0]);   // db 정보 말고 테이블만 가져오기 위해

    } catch(error){
        console.log(error)
        return res.json({
            success: false,
            message: "전체 주문 목록 조회에 실패하였습니다."
        });
    }
});

// 주문 추가하기
app.post("/api/orders", upload.single('file'), async(req, res) => {      
    try{

        console.log(req.body);
        const data = await pool.query(`INSERT INTO orders (quantity, request_detail, menus_id)
         VALUES (?, ?, ?)`, [req.body.quantity, req.body.request_detail, req.body.menus_id]);

        return res.json({
            success: true,
            message: `주문이 추가되었습니다.`
        });   
    } catch(error){
        return res.json({
            success: false,
            message: "주문에 실패하였습니다."
        });
    }
});


app.listen(PORT, ()=> console.log(`서버 기동중 ${PORT}`));



