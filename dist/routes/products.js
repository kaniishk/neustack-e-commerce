"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productsStore_1 = require("../store/productsStore");
const router = (0, express_1.Router)();
router.get('/', (_req, res) => {
    res.json((0, productsStore_1.listProducts)());
});
exports.default = router;
//# sourceMappingURL=products.js.map