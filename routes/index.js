let express = require("express");
let router = express.Router();
let con = require("./connect");
let jwt = require("jsonwebtoken");
let secretCode = "hihowareyou";
let session = require("express-session");
let formidable = require("formidable");
let fs = require("fs");
let dayjs = require("dayjs");
const { query } = require("./connect2");


router.use(
  session({
    secret: "hihowareyoutoday",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
  })
);

router.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.dayjs = dayjs;
  next();
});

/* GET home page. */
router.get("/", async function (req, res, next) {
  let conn = require("./connect2");
  let sql = "SELECT * FROM tb_product";
  let params = [];

  if (req.query.search != undefined) {
    sql += " WHERE name LIKE(?)";
    params.push("%" + req.query.search + "%");
  }

  if (req.query.cateId != undefined) {
    sql += " WHERE group_product_id LIKE(?)";
    params.push(req.query.cateId);
  }

  try {
    let [products, fields] = await conn.query(sql, params);
    sql = "SELECT * FROM tb_group_product ORDER BY name ASC";
    let [category, fieldcate] = await conn.query(sql);

    // เรียกคำสั่ง SQL เพื่อคำนวณจำนวนสินค้าที่ขายได้แต่ละอย่าง
    let [soldItems, fieldsSold] = await conn.query(
      "SELECT product_id, SUM(qty) AS totalQty FROM tb_order_detail GROUP BY product_id"
    );

    // สร้างออบเจกต์ Map เพื่อเก็บจำนวนที่ขายได้แต่ละอย่างโดยใช้ product_id เป็น key
    let soldItemMap = new Map();
    soldItems.forEach((item) => {
      soldItemMap.set(item.product_id, item.totalQty);
    });

    if (req.session.cart == undefined) {
      req.session.cart = [];
    }

    res.render("index", {
      pro: products,
      cate: category,
      soldItems: soldItemMap,
    });
  } catch (err) {
    console.error("Error querying database:", err);
    res.status(500).send("An error occurred while fetching data.");
  }
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", (req, res) => {
  let sql = "SELECT * FROM tb_user WHERE usr = ? AND pwd = ?";
  let params = [req.body["usr"], req.body["pwd"]];
  con.query(sql, params, (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      let id = result[0].id;
      let name = result[0].name;
      let token = jwt.sign({ id: id, name: name }, secretCode);

      req.session.token = token;
      req.session.name = name;

      res.redirect("/home");
    } else {
      res.send("Username or Password Invalid");
    }
  });
});

function isLogin(req, res, next) {
  if (req.session.token != undefined) {
    next();
  } else {
    res.redirect("/login");
  }
}

router.get("/home", isLogin, async (req, res) => {
  try {
    const conn = require("./connect2");

    const sumRevenueQuery =
      "SELECT SUM(price*qty) AS revenue FROM tb_order_detail";
    const [revenueRows] = await conn.query(sumRevenueQuery);

    const countSellerQuery = "SELECT COUNT(id) AS Totalseller FROM tb_seller";
    const [sellerRows] = await conn.query(countSellerQuery);

    const countOrder = "SELECT COUNT(id) AS TotalOrder FROM tb_order";
    const [orderRows] = await conn.query(countOrder);

    const UserInfo = "SELECT * FROM tb_user";
    const [userRows] = await conn.query(UserInfo);

    const productFamous = `
    SELECT tb_product.*, tb_group_product.name AS group_product_name
    FROM tb_product
    INNER JOIN tb_group_product ON tb_product.group_product_id = tb_group_product.id
    INNER JOIN tb_order_detail ON tb_product.id = tb_order_detail.product_id
    GROUP BY tb_product.id
    HAVING COUNT(tb_order_detail.id) >= 3
  `;

    const [productRows] = await conn.query(productFamous);

    res.render("home", {
      rev: revenueRows[0],
      seller: sellerRows[0],
      order: orderRows[0],
      user: userRows,
      product: productRows
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("An error occurred.");
  }
});

router.get("/logout", isLogin, (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

router.get("/profile", isLogin, (req, res) => {
  let data = jwt.verify(req.session.token, secretCode);
  let sql = "SELECT * FROM tb_user WHERE id = ?";
  let params = [data.id];

  con.query(sql, params, (err, result) => {
    if (err) throw err;
    res.render("profile", { user: result[0] });
  });
});

router.post("/profile", isLogin, (req, res) => {
  let data = jwt.verify(req.session.token, secretCode);
  let sql = "UPDATE tb_user SET name = ?, usr = ?";
  let params = [req.body["name"], req.body["usr"]];

  if (req.body["pwd"] !== undefined && req.body["pwd"] !== "") {
    sql += ", pwd = ?";
    params.push(req.body["pwd"]);
  }

  if (data.id) {
    sql += " WHERE id = ?";
    params.push(data.id);
  }

  con.query(sql, params, (err, result) => {
    if (err) throw err;
    req.session.message = "Save Success";
    res.redirect("/profile");
  });
});

router.get("/user", isLogin, (req, res) => {
  let sql = "SELECT * FROM tb_user ORDER BY id DESC";
  con.query(sql, (err, result) => {
    if (err) throw err;
    res.render("user", { user: result });
  });
});

router.get("/addUser", isLogin, (req, res) => {
  res.render("addUser", { user: {} });
});

router.post("/addUser", isLogin, (req, res) => {
  let sql = "INSERT INTO tb_user SET ?";
  let params = req.body;

  con.query(sql, params, (err, result) => {
    if (err) throw err;
    res.redirect("/addUser");
  });
});

router.get("/editUser/:id", isLogin, (req, res) => {
  let sql = "SELECT * FROM tb_user WHERE id = ?";
  let params = req.params.id;
  con.query(sql, params, (err, result) => {
    if (err) throw err;
    res.render("addUser", { user: result[0] });
  });
});

router.post("/editUser/:id", isLogin, (req, res) => {
  let sql =
    "UPDATE tb_user SET name = ?, usr = ?, pwd = ?, level = ? WHERE id =?";
  let params = [
    req.body["name"],
    req.body["usr"],
    req.body["pwd"],
    req.body["level"],
    req.params.id,
  ];

  con.query(sql, params, (err, result) => {
    if (err) throw err;
    res.redirect("/user");
  });
});

router.get("/deleteUser/:id", isLogin, (req, res) => {
  let sql = "DELETE FROM tb_user WHERE id = ?";
  let params = req.params.id;
  con.query(sql, params, (err, result) => {
    if (err) throw err;
    res.redirect("/user");
  });
});

router.get("/groupProduct", isLogin, (req, res) => {
  con.query("SELECT * FROM tb_group_product", (err, result) => {
    if (err) throw err;
    res.render("groupProduct", { category: result });
  });
});

router.get("/addGroupProduct", isLogin, (req, res) => {
  res.render("addGroupProduct", { category: {} });
});

router.post("/addGroupProduct", isLogin, (req, res) => {
  let sql = "INSERT INTO tb_group_product SET ?";
  con.query(sql, req.body, (err, result) => {
    if (err) throw err;
    res.redirect("/addGroupProduct");
  });
});

router.get("/deteleCate/:id", isLogin, (req, res) => {
  con.query(
    "DELETE FROM tb_group_product WHERE id = ?",
    req.params.id,
    (err, result) => {
      if (err) throw err;
      res.redirect("/groupProduct");
    }
  );
});

router.get("/editCate/:id", isLogin, (req, res) => {
  con.query(
    "SELECT * FROM tb_group_product WHERE id = ?",
    req.params.id,
    (err, result) => {
      if (err) throw err;
      res.render("addGroupProduct", { category: result[0] });
    }
  );
});

router.post("/editCate/:id", isLogin, (req, res) => {
  let sql = "UPDATE tb_group_product SET name = ? WHERE id = ?";
  let params = [req.body["name"], req.params.id];
  con.query(sql, params, (err, result) => {
    if (err) throw err;
    res.redirect("/groupProduct");
  });
});

router.get("/product", isLogin, (req, res) => {
  con.query(
    "SELECT tb_product.*, tb_group_product.name AS group_product_name FROM tb_product LEFT JOIN tb_group_product ON tb_group_product.id = tb_product.group_product_id",
    (err, result) => {
      if (err) throw err;
      res.render("product", { product: result });
    }
  );
});

router.get("/addProduct", isLogin, (req, res) => {
  con.query("SELECT * FROM tb_group_product ORDER BY name", (err, result) => {
    if (err) throw err;
    res.render("addProduct", { product: {}, cate: result });
  });
});

router.post("/addProduct", isLogin, (req, res) => {
  let form = new formidable.IncomingForm();
  form.parse(req, (error, fields, file) => {
    let uploadedFile = file.img[0];

    let filepath = uploadedFile.filepath;
    let newpath =
      "D://website/full_stack_course/Node.js_to_the_moon/E-commerce/app/public/images/";
    newpath += uploadedFile.originalFilename;

    const barcode = generateBarcode();

    fs.copyFile(filepath, newpath, () => {
      let sql =
        "INSERT INTO tb_product(group_product_id, barcode, name, price, cost, img, stock_qty, detail) VALUES(?, ?, ?, ?, ?, ?, ?, ?)";
      let params = [
        fields["group_product_id"],
        barcode, // ใช้ barcode ที่สร้างขึ้น
        fields["name"],
        fields["price"],
        fields["cost"],
        uploadedFile.originalFilename,
        fields["stock_qty"],
        fields["detail"],
      ];
      con.query(sql, params, (err, result) => {
        if (err) throw err;
        res.redirect("/addProduct");
      });
    });
  });
});

// ฟังก์ชันสร้าง barcode อัตโนมัติ
function generateBarcode() {
  const characters = "0123456789";
  const barcodeLength = 20;
  let barcode = "";

  for (let i = 0; i < barcodeLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    barcode += characters.charAt(randomIndex);
  }

  return barcode;
}

router.get("/deletePro/:id", isLogin, (req, res) => {
  con.query(
    "SELECT img FROM tb_product WHERE id = ?",
    req.params.id,
    (err, result) => {
      if (err) throw err;
      let product = result[0];

      if (product && product.img) {
        // ลบไฟล์รูปภาพที่เกี่ยวข้องกับสินค้า
        fs.unlink(
          "D://website/full_stack_course/Node.js_to_the_moon/E-commerce/app/public/images/" +
            product.img,
          (err) => {
            if (err) throw err;
            // หลังจากลบไฟล์รูปภาพสำเร็จ ให้ลบข้อมูลสินค้าในฐานข้อมูล
            con.query(
              "DELETE FROM tb_product WHERE id = ?",
              req.params.id,
              (err, result) => {
                if (err) throw err;
                res.redirect("/product");
              }
            );
          }
        );
      } else {
        // หากไม่มีไฟล์รูปภาพที่เกี่ยวข้องกับสินค้า ให้ลบข้อมูลสินค้าในฐานข้อมูลเลย
        con.query(
          "DELETE FROM tb_product WHERE id = ?",
          req.params.id,
          (err, result) => {
            if (err) throw err;
            res.redirect("/product");
          }
        );
      }
    }
  );
});

router.get("/editPro/:id", isLogin, (req, res) => {
  con.query(
    "SELECT * FROM tb_product WHERE id =?",
    req.params.id,
    (err, product) => {
      if (err) throw err;
      con.query(
        "SELECT * FROM tb_group_product ORDER BY name",
        (err, groupProduct) => {
          res.render("addProduct", { product: product[0], cate: groupProduct });
        }
      );
    }
  );
});

router.post("/editPro/:id", isLogin, (req, res) => {
  let form = new formidable.IncomingForm();
  form.parse(req, (error, fields, file) => {
    if (file.img && file.img.length > 0) {
      let uploadedFile = file.img[0];
      let filepath = uploadedFile.filepath;
      let newpath =
        "D://website/full_stack_course/Node.js_to_the_moon/E-commerce/app/public/images/";
      newpath += uploadedFile.originalFilename;

      fs.copyFile(filepath, newpath, () => {
        con.query(
          "SELECT img FROM tb_product WHERE id = ?",
          req.params.id,
          (err, oldPro) => {
            if (err) throw err;
            let product = oldPro[0];
            fs.unlink(
              "D://website/full_stack_course/Node.js_to_the_moon/E-commerce/app/public/images/" +
                product.img,
              (err) => {
                if (err) throw err;
              }
            );

            let sql =
              "UPDATE tb_product SET group_product_id = ?, barcode = ?, name = ?, price = ?, cost = ?, img = ?, stock_qty = ?, detail = ? WHERE id = ?";
            let params = [
              fields["group_product_id"],
              fields["barcode"],
              fields["name"],
              fields["price"],
              fields["cost"],
              uploadedFile.originalFilename,
              fields["stock_qty"],
              fields["detail"],
              req.params.id,
            ];
            con.query(sql, params, (err, result) => {
              if (err) throw err;
              res.redirect("/product");
            });
          }
        );
      });
    } else {
      let sql =
        "UPDATE tb_product SET group_product_id = ?, barcode = ?, name = ?, price = ?, cost = ?, stock_qty = ?, detail = ? WHERE id = ?";
      let params = [
        fields["group_product_id"],
        fields["barcode"],
        fields["name"],
        fields["price"],
        fields["cost"],
        fields["stock_qty"],
        fields["detail"],
        req.params.id,
      ];
      con.query(sql, params, (err, result) => {
        if (err) throw err;
        res.redirect("/product");
      });
    }
  });
});

router.get("/addToCart/:id", (req, res) => {
  let cart = req.session.cart || [];

  let productIndex = cart.findIndex(
    (item) => item.product_id === req.params.id
  );

  if (productIndex === -1) {
    cart.push({
      product_id: req.params.id,
      qty: 1,
    });
  } else {
    cart[productIndex].qty += 1;
  }

  req.session.cart = cart;

  res.redirect("/myCart");
});

router.get("/myCart", async (req, res) => {
  let conn = require("./connect2");
  let cart = req.session.cart;
  let products = [];
  let totalQty = 0;
  let totalPrice = 0;

  if (cart.length > 0) {
    for (let i = 0; i < cart.length; i++) {
      let c = cart[i];
      let sql = "SELECT * FROM tb_product WHERE id = ?";
      let params = [c.product_id];

      let [rows, fields] = await conn.query(sql, params);
      let product = rows[0];

      let p = {
        qty: c.qty,
        id: product.id,
        barcode: product.barcode,
        name: product.name,
        price: product.price,
        img: product.img,
      };
      products.push(p);

      totalQty += c.qty;
      totalPrice += c.qty * product.price;
    }
  }

  res.render("myCart", {
    products: products,
    totalQty: totalQty,
    totalPrice,
  });
});

router.get("/deleteItemCart/:id", (req, res) => {
  let cart = req.session.cart;

  for (let i = 0; i < cart.length; i++) {
    if (cart[i].product_id == req.params.id) {
      cart.splice(i, 1);
    }
  }

  req.session.cart = cart;
  res.redirect("/myCart");
});

router.post("/plus/:id", (req, res) => {
  let cart = req.session.cart;

  for (let i = 0; i < cart.length; i++) {
    if (cart[i].product_id == req.params.id) {
      cart[i].qty++;
    }
  }

  req.session.cart = cart;
  res.redirect("/myCart");
});

router.post("/minus/:id", (req, res) => {
  let cart = req.session.cart;

  for (let i = 0; i < cart.length; i++) {
    if (cart[i].product_id == req.params.id) {
      cart[i].qty--;

      // ตรวจสอบว่า qty ไม่ต่ำกว่า 1
      if (cart[i].qty < 1) {
        cart[i].qty = 1;
      }
    }
  }

  req.session.cart = cart;
  res.redirect("/myCart");
});

router.get("/confirmOrder", (req, res) => {
  res.render("confirmOrder");
});

router.post("/confirmOrder", async (req, res) => {
  let conn = require("./connect2");

  try {
    let sql =
      "INSERT INTO tb_order(name, address, phone, status, created_date) VALUES(?, ?, ?, 'ຍັງບໍ່ຊຳລະເງີນ', NOW())";
    let params = [req.body["name"], req.body["address"], req.body["phone"]];

    const [result, fields] = await conn.query(sql, params);
    const lastId = result.insertId;

    let carts = req.session.cart;

    for (let i = 0; i < carts.length; i++) {
      let cart = carts[i];
      let sqlfindProduct = "SELECT price FROM tb_product WHERE id = ?";
      params = [cart.product_id];
      const [productRows, productFields] = await conn.query(
        sqlfindProduct,
        params
      );

      if (productRows.length > 0) {
        let price = productRows[0].price;

        let sqlOrderDetail =
          "INSERT INTO tb_order_detail(order_id, product_id, qty, price) VALUES(?, ?, ?, ?)";
        params = [lastId, cart.product_id, cart.qty, price];

        await conn.query(sqlOrderDetail, params);
      }
    }

    req.session.cart = [];
    // ในหน้าที่ส่ง orderId ไปยังหน้า confirmPay
    res.redirect(`/confirmPay?orderId=${lastId}`);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error occurred.");
  }
});

router.get("/orderSuccess", (req, res) => {
  res.render("orderSuccess");
});

router.get("/order", isLogin, (req, res) => {
  con.query("SELECT * FROM tb_order ORDER BY id DESC", (err, result) => {
    if (err) throw err;
    res.render("order", { order: result });
  });
});

router.get("/orderInfo/:id", isLogin, (req, res) => {
  let sql = "";
  sql +=
    " SELECT tb_order_detail.*, tb_product.barcode,  tb_product.name,  tb_product.img FROM tb_order_detail";
  sql += " LEFT JOIN tb_product ON tb_product.id = tb_order_detail.product_id";
  sql += " WHERE tb_order_detail.order_id = ?";
  sql += " ORDER BY tb_order_detail.id DESC";

  let totalQty = 0;
  let totalPrice = 0;

  con.query(sql, req.params.id, (err, result) => {
    if (err) throw err;

    for (let i = 0; i < result.length; i++) {
      let orderInfo = result[i];
      totalQty += orderInfo.qty;
      totalPrice += orderInfo.qty * orderInfo.price;
    }
    res.render("orderInfo", {
      orderdetail: result,
      totalPrice: totalPrice,
      totalQty: totalQty,
    });
  });
});

router.get("/delOrder/:orderId", isLogin, async (req, res) => {
  let conn = require("./connect2");
  let orderId = req.params.orderId;

  // ดึงข้อมูล order เพื่อตรวจสอบสถานะ
  let getOrderStatusSql = "SELECT status FROM tb_order WHERE id = ?";
  let [orderStatusRows, orderStatusFields] = await conn.query(
    getOrderStatusSql,
    [orderId]
  );

  if (orderStatusRows.length > 0) {
    const orderStatus = orderStatusRows[0].status;

    if (orderStatus !== "ຈັດສົ່ງແລ້ວ") {
      // ดึงข้อมูลสินค้าที่เป็นส่วนของ order
      let getOrderDetailsSql =
        "SELECT * FROM tb_order_detail WHERE order_id = ?";
      let [orderDetails, orderDetailFields] = await conn.query(
        getOrderDetailsSql,
        [orderId]
      );

      for (const orderDetail of orderDetails) {
        const productId = orderDetail.product_id;
        const quantity = orderDetail.qty;

        // ดึงข้อมูลสินค้าปัจจุบัน
        let getCurrentStockSql =
          "SELECT stock_qty FROM tb_product WHERE id = ?";
        let [currentStockRows, currentStockFields] = await conn.query(
          getCurrentStockSql,
          [productId]
        );

        if (currentStockRows.length > 0) {
          const currentStock = currentStockRows[0].stock_qty;
          const updatedStock = currentStock + quantity;

          // อัปเดตสต็อกสินค้าในฐานข้อมูล
          let updateStockSql =
            "UPDATE tb_product SET stock_qty = ? WHERE id = ?";
          await conn.query(updateStockSql, [updatedStock, productId]);
        }
      }

      // ลบ order และรายละเอียด order (order details)
      let deleteOrderSql = "DELETE FROM tb_order WHERE id = ?";
      await conn.query(deleteOrderSql, [orderId]);

      let deleteOrderDetailsSql =
        "DELETE FROM tb_order_detail WHERE order_id = ?";
      await conn.query(deleteOrderDetailsSql, [orderId]);

      res.redirect("/order");
    } else {
      res
        .status(403)
        .send("ไม่สามารถลบ order ที่มีสถานะเป็น 'ຈັດສົ່ງແລ້ວ' ได้");
    }
  } else {
    res.status(404).send("ไม่พบ order ที่ต้องการลบ");
  }
});

router.get("/pay/:id", isLogin, (req, res) => {
  let orderId = req.params.id;

  // ตรวจสอบสถานะของคำสั่งที่มี order_id เท่ากับ orderId
  let sql = "SELECT status FROM tb_order WHERE id = ?";
  let params = [orderId];

  con.query(sql, params, (err, result) => {
    if (err) {
      console.error("Error checking order status:", err);
      return res.status(500).send("Internal Server Error");
    }

    if (result.length === 0) {
      // ไม่พบคำสั่งที่ตรงกับ order_id
      return res.status(404).send("Order not found");
    }

    // ตรวจสอบสถานะและ render หน้าเพจตามเงื่อนไข
    if (result[0].status === "ຈ່າຍແລ້ວ" || result[0].status === "ຈັດສົ່ງແລ້ວ") {
      res.render("paysuccess2", { orderId });
    } else {
      res.render("pay", { orderId });
    }
  });
});

router.post("/pay/:id", isLogin, async (req, res) => {
  let conn = require("./connect2");

  try {
    const orderId = req.params.id;

    // อัปเดตสถานะการจ่ายเงิน
    let updateOrderSql =
      'UPDATE tb_order SET status = "ຈ່າຍແລ້ວ", pay_date = ?, pay_remark = ? WHERE id = ?';
    let updateOrderParams = [req.body.pay_date, req.body.pay_remark, orderId];

    await conn.query(updateOrderSql, updateOrderParams);

    // ดึงรายละเอียดคำสั่งซื้อ
    let getOrderDetailSql = "SELECT * FROM tb_order_detail WHERE order_id = ?";
    let getOrderDetailParams = [orderId];

    const [orderDetails, orderDetailFields] = await conn.query(
      getOrderDetailSql,
      getOrderDetailParams
    );

    // ตัดสต็อกสินค้า
    for (const orderDetail of orderDetails) {
      let productId = orderDetail.product_id;
      let quantity = orderDetail.qty;

      // ดึงข้อมูลสินค้าปัจจุบัน
      let getProductSql = "SELECT stock_qty FROM tb_product WHERE id = ?";
      let getProductParams = [productId];

      const [productRows, productFields] = await conn.query(
        getProductSql,
        getProductParams
      );

      if (productRows.length > 0) {
        let currentStock = productRows[0].stock_qty;

        if (quantity <= currentStock) {
          let updatedStock = currentStock - quantity;

          // อัปเดตสต็อกสินค้าในฐานข้อมูล
          let updateStockSql =
            "UPDATE tb_product SET stock_qty = ? WHERE id = ?";
          let updateStockParams = [updatedStock, productId];

          await conn.query(updateStockSql, updateStockParams);
        } else {
          console.log(
            `ไม่สามารถตัดสต็อกสินค้า ${productId} จำนวน ${quantity} ชิ้นได้ เนื่องจากสต็อกไม่เพียงพอ`
          );
        }
      }
    }

    res.render("paysuccess");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error occurred.");
  }
});

router.get("/sendOrder/:id", isLogin, (req, res) => {
  let orderId = req.params.id;

  // ตรวจสอบสถานะของคำสั่งที่มี order_id เท่ากับ orderId
  let sql = "SELECT status FROM tb_order WHERE id = ?";
  let params = [orderId];

  con.query(sql, params, (err, result) => {
    if (err) {
      console.error("Error checking order status:", err);
      return res.status(500).send("Internal Server Error");
    }

    if (result.length === 0) {
      // ไม่พบคำสั่งที่ตรงกับ order_id
      return res.status(404).send("Order not found");
    }

    // ตรวจสอบสถานะและ render หน้าเพจตามเงื่อนไข
    if (result[0].status === "ຈັດສົ່ງແລ້ວ") {
      res.render("delivery2", { orderId });
    } else {
      res.render("sendOrder", { orderId });
    }
  });
});

router.post("/sendOrder/:id", isLogin, (req, res) => {
  let sql =
    'UPDATE tb_order SET status = "ຈັດສົ່ງແລ້ວ", send_date = ?, track_name = ?, track_code = ?, send_remark = ? WHERE id = ?';
  let params = [
    req.body["send_date"],
    req.body["track_name"],
    req.body["track_code"],
    req.body["send_remark"],
    req.params.id,
  ];

  con.query(sql, params, (err, result) => {
    if (err) throw err;
    res.render("Delivered");
  });
});

router.get("/rptDay", isLogin, async (req, res) => {
  let conn = require("./connect2");
  let y = dayjs().year();
  let yForLoop = dayjs().year();
  let m = dayjs().month() + 1;
  let daysInMonth = dayjs(y + "/" + m + "/1").daysInMonth();
  let arr = [];
  let arrYear = [];
  let arrMonth = [
    "ມັງກອນ",
    "ກຸມພາ",
    "ມີນາ",
    "ເມສາ",
    "ພຶດສະພາ",
    "ມິຖຸນາ",
    "ກໍລະກົດ",
    "ສິງຫາ",
    "ກັນຍາ",
    "ຕຸລາ",
    "ພະຈິກ",
    "ທັນວາ",
  ];

  if (req.query["year"] != undefined) {
    y = req.query["year"];
    m = req.query["month"];
  }
  for (let i = 1; i <= daysInMonth; i++) {
    if (i === 0) continue;

    let sql = "";
    sql += " SELECT SUM(qty * price) AS totalPrice FROM tb_order_detail";
    sql += " LEFT JOIN tb_order ON tb_order.id = tb_order_detail.order_id";
    sql += " WHERE DAY(tb_order.pay_date) = ?";
    sql += " AND MONTH(tb_order.pay_date) = ?";
    sql += " AND YEAR(tb_order.pay_date) = ?";

    let params = [i, m, y];
    let [rows, fields] = await conn.query(sql, params);
    arr.push(rows[0].totalPrice);
  }

  for (let i = yForLoop - 4; i <= yForLoop; i++) {
    arrYear.push(i);
  }

  res.render("rptDay", {
    arr: arr,
    y: y,
    m: m,
    arrYear: arrYear,
    arrMonth: arrMonth,
  });
});

router.get("/rptMonth", isLogin, async (req, res) => {
  let conn = require("./connect2");
  let y = dayjs().year();
  let yForLoop = dayjs().year();
  let arr = [];
  let arrYear = [];

  if (req.query["year"] != undefined) {
    y = req.query["year"];
  }

  for (let i = 1; i <= 12; i++) {
    let sql = "";
    sql += " SELECT SUM(qty * price) AS totalPrice FROM tb_order_detail";
    sql += " LEFT JOIN tb_order ON tb_order.id = tb_order_detail.order_id";
    sql += " WHERE MONTH(tb_order.pay_date) = ?";
    sql += " AND YEAR(tb_order.pay_date) = ?";

    let params = [i, y];
    let [rows, fields] = await conn.query(sql, params);

    arr.push(rows[0].totalPrice);
  }
  for (let i = yForLoop - 4; i <= yForLoop; i++) {
    arrYear.push(i);
  }

  res.render("rptMonth", { arr: arr, y: y, arrYear: arrYear });
});

router.get("/rptSalePro", isLogin, async (req, res) => {
  try {
    let conn = require("./connect2");

    // ดึงข้อมูลผลิตภัณฑ์
    let sqlProduct = "SELECT id, barcode, name FROM tb_product";
    let [productRows, productFields] = await conn.query(sqlProduct);

    // เก็บผลลัพธ์
    let results = [];

    // คำนวณยอดขายสำหรับแต่ละผลิตภัณฑ์
    for (let i = 0; i < productRows.length; i++) {
      let product = productRows[i];
      let id = product.id;
      let barcode = product.barcode;
      let name = product.name;

      // คำนวณยอดขาย
      let sqlTotal =
        "SELECT SUM(qty * price) AS totalPrice, SUM(qty) AS totalQty FROM tb_order_detail";
      sqlTotal +=
        " LEFT JOIN tb_order ON tb_order.id = tb_order_detail.order_id";
      sqlTotal += " WHERE tb_order_detail.product_id = ?";
      sqlTotal += " AND tb_order.pay_date IS NOT NULL";

      let [totalRows, totalFields] = await conn.query(sqlTotal, [id]);
      let totalPrice = totalRows[0].totalPrice;
      let totalQty = totalRows[0].totalQty;

      // เพิ่มผลลัพธ์ลงในอาร์เรย์
      results.push({
        totalPrice: totalPrice || 0, // ให้เป็น 0 ถ้าไม่มีรายการขาย
        barcode: barcode,
        id: id,
        name: name,
        totalQty: totalQty || 0,
      });
    }

    res.render("rptSalePro", { arr: results });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/trackOrder", (req, res) => {
  res.render("trackOrder", { order: {} });
});

router.post("/trackOrder", (req, res) => {
  let sql =
    "SELECT * FROM tb_order WHERE phone = ? AND pay_date IS NOT NULL ORDER BY id DESC LIMIT 1";
  con.query(sql, req.body["phone"], (err, result) => {
    if (err) throw err;
    console.log(result);
    res.render("trackOrder", { order: result[0] });
  });
});

// customer payment
router.get("/confirmPay", (req, res) => {
  const orderId = req.query.orderId;
  res.render("confirmPay", { orderId, req }); // ส่ง req ไปด้วยแม่แบบ EJS
});

router.post("/confirmPay", (req, res) => {
  let form = new formidable.IncomingForm();
  form.parse(req, (error, fields, file) => {
    let uploadedFile = file.pay_img[0];

    let filepath = uploadedFile.filepath;
    let newpath =
      "D://website/full_stack_course/Node.js_to_the_moon/E-commerce/app/public/images/payment/";
    newpath += uploadedFile.originalFilename;

    fs.copyFile(filepath, newpath, () => {
      let sql = "UPDATE tb_order SET pay_img = ? WHERE id = ?";
      let params = [uploadedFile.originalFilename, req.query["orderId"]];
      con.query(sql, params, (err, result) => {
        if (err) throw err;
        res.render("orderSuccess");
      });
    });
  });
});

router.get("/proDetail/:id", async (req, res) => {
  try {
    const conn = await require("./connect2"); // เปลี่ยนการเรียกใช้ connect2 เป็น await
    const productId = req.params.id;

    // คำสั่ง SQL เพื่อดึงข้อมูลของสินค้าที่เลือก
    const sqlProductDetail = `
      SELECT
        tb_product.*,
        tb_group_product.name AS group_product_name
      FROM
        tb_product
      LEFT JOIN
        tb_group_product
      ON
        tb_group_product.id = tb_product.group_product_id
      WHERE
        tb_product.id = ?`;

    // คำสั่ง SQL เพื่อดึงข้อมูลสินค้าที่มีจำนวนที่ขายได้ 2 ชิ้นขึ้นไป
    const sqlSoldProducts = `
    SELECT
      tb_product.*
    FROM
      tb_product
    WHERE
      tb_product.group_product_id = ? AND tb_product.id != ?
  `;

    const [productResult] = await conn.query(sqlProductDetail, [productId]);
    const [soldProductsResult] = await conn.query(sqlSoldProducts, [
      productResult[0].group_product_id,
      productId,
    ]);

    console.log(soldProductsResult);
    res.render("proDetail", {
      pro: productResult,
      product: soldProductsResult,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred.");
  }
});

router.get("/addSeller", (req, res) => {
  res.render("addSeller");
});

// about_seller
router.post("/addSeller", (req, res) => {
  let sql = "INSERT INTO tb_seller SET ?";
  let params = req.body;

  con.query(sql, params, (err, result) => {
    if (err) throw err;
    res.redirect("/");
  });
});

router.get("/loginSeller", (req, res) => {
  res.render("loginSeller");
});

router.post("/loginSeller", (req, res) => {
  let sql = "SELECT * FROM tb_seller WHERE usr = ? AND pass = ?";
  let params = [req.body["usr"], req.body["pass"]];
  con.query(sql, params, (err, result) => {
    if (err) throw err;
    console.log(result);

    if (result.length > 0) {
      let id = result[0].id;
      let name = result[0].name;
      let token = jwt.sign({ id: id, name: name }, secretCode);

      req.session.token = token;
      req.session.name = name;

      res.redirect("/");
    } else {
      res.send("Username or Password Invalid");
    }
  });
});

router.get("/logoutSeller", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

function isLogin2(req, res, next) {
  if (req.session.token != undefined) {
    next();
  } else {
    res.redirect("/loginSeller");
  }
}

router.get("/postSeller", (req, res) => {
  let sql = "SELECT * FROM tb_post";
  con.query(sql, (err, result) => {
    if (err) throw err;
    res.render("postSeller", { post: result });
  });
});

router.get("/addPost", isLogin2, (req, res) => {
  res.render("addPost", { post: [] });
});

router.post("/addPost", isLogin2, (req, res) => {
  let data = jwt.verify(req.session.token, secretCode);
  let form = new formidable.IncomingForm();
  form.parse(req, (error, fields, file) => {
    let uploadedFile = file.img[0];

    let filepath = uploadedFile.filepath;
    let newpath =
      "D://website/full_stack_course/Node.js_to_the_moon/E-commerce/app/public/images/seller/";
    newpath += uploadedFile.originalFilename;

    fs.copyFile(filepath, newpath, () => {
      let sql =
        "INSERT INTO tb_post(name, price, address, contact, detail, img, post_by) VALUES(?, ?, ?, ?, ?, ?, ?)";
      let params = [
        fields["name"],
        fields["price"],
        fields["address"],
        fields["contact"],
        fields["detail"],
        uploadedFile.originalFilename,
        data.id,
      ];
      con.query(sql, params, (err, result) => {
        if (err) throw err;
        res.redirect("/postSeller");
      });
    });
  });
});

router.get("/postDetail/:id", (req, res) => {
  let sql =
    "SELECT tb_post.*, tb_seller.usr FROM tb_post INNER JOIN tb_seller ON tb_post.post_by = tb_seller.id WHERE tb_post.id = ?";
  con.query(sql, req.params.id, (err, result) => {
    if (err) throw err;
    res.render("postDetail", { postDetail: result });
  });
});

router.get("/editSeller", isLogin2, (req, res) => {
  let data = jwt.verify(req.session.token, secretCode);
  let sql = "SELECT * FROM tb_seller WHERE id = ?";
  let params = [data.id];

  con.query(sql, params, (err, result) => {
    if (err) throw err;
    res.render("editSeller", { seller: result[0] });
  });
});

router.post("/editSeller", isLogin2, async (req, res) => {
  try {
    const conn = require("./connect2");

    const data = jwt.verify(req.session.token, secretCode);

    // ทำการอัปเดตข้อมูลผู้ขาย
    const updateQuery =
      "UPDATE tb_seller SET name = ?, surname = ?, tel = ?, usr = ?, pass = ? WHERE id = ?";
    const updateParams = [
      req.body["name"],
      req.body["surname"],
      req.body["tel"],
      req.body["usr"],
      req.body["pass"],
      data.id,
    ];

    await conn.query(updateQuery, updateParams);
    res.redirect("/");
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("An error occurred.");
  }
});

router.get("/mypost", isLogin2, (req, res) => {
  const data = jwt.verify(req.session.token, secretCode);
  con.query(
    "SELECT * FROM tb_post WHERE post_by = ?",
    data.id,
    (err, result) => {
      if (err) throw err;
      res.render("mypost", { post: result });
    }
  );
});

router.get("/deletePost/:id", isLogin2, (req, res) => {
  con.query(
    "SELECT img FROM tb_post WHERE id = ?",
    req.params.id,
    (err, result) => {
      if (err) throw err;
      let product = result[0];

      if (product && product.img) {
        fs.unlink(
          "D://website/full_stack_course/Node.js_to_the_moon/E-commerce/app/public/images/seller/" +
            product.img,
          (err) => {
            if (err) throw err;
            con.query(
              "DELETE FROM tb_post WHERE id = ?",
              req.params.id,
              (err, result) => {
                if (err) throw err;
                res.redirect("/mypost");
              }
            );
          }
        );
      } else {
        con.query(
          "DELETE FROM tb_post WHERE id = ?",
          req.params.id,
          (err, result) => {
            if (err) throw err;
            res.redirect("/mypost");
          }
        );
      }
    }
  );
});

router.get("/editPost/:id", isLogin2, (req, res) => {
  con.query(
    "SELECT * FROM tb_post WHERE id = ?",
    req.params.id,
    (err, result) => {
      if (err) throw err;
      res.render("addPost", { post: result[0] });
    }
  );
});

router.post("/editPost/:id", isLogin2, (req, res) => {
  let form = new formidable.IncomingForm();
  form.parse(req, (error, fields, file) => {
    if (file.img && file.img.length > 0) {
      let uploadedFile = file.img[0];
      let filepath = uploadedFile.filepath;
      let newpath =
        "D://website/full_stack_course/Node.js_to_the_moon/E-commerce/app/public/images/seller/";
      newpath += uploadedFile.originalFilename;

      fs.copyFile(filepath, newpath, () => {
        con.query(
          "SELECT img FROM tb_post WHERE id = ?",
          req.params.id,
          (err, oldPro) => {
            if (err) throw err;
            let product = oldPro[0];
            fs.unlink(
              "D://website/full_stack_course/Node.js_to_the_moon/E-commerce/app/public/images/seller/" +
                product.img,
              (err) => {
                if (err) throw err;
              }
            );

            let sql =
              "UPDATE tb_post SET name = ?, price = ?, address = ?, contact = ?, detail = ?, img = ? WHERE id = ?";
            let params = [
              fields["name"],
              fields["price"],
              fields["address"],
              fields["contact"],
              fields["detail"],
              uploadedFile.originalFilename,
              req.params.id,
            ];
            con.query(sql, params, (err, result) => {
              if (err) throw err;
              res.redirect("/mypost");
            });
          }
        );
      });
    } else {
      let sql =
        "UPDATE tb_post SET name = ?, price = ?, address = ?, contact = ?, detail = ? WHERE id = ?";
      let params = [
        fields["name"],
        fields["price"],
        fields["address"],
        fields["contact"],
        fields["detail"],
        req.params.id,
      ];
      con.query(sql, params, (err, result) => {
        if (err) throw err;
        res.redirect("/mypost");
      });
    }
  });
});
// About Seller

router.get("/seller", isLogin, (req, res) => {
  con.query("SELECT * FROM tb_seller", (err, result) => {
    res.render("seller", { seller: result });
  });
});

module.exports = router;
