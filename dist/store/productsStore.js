"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProducts = listProducts;
exports.getProductById = getProductById;
// Simple in-memory product catalog. In a real system this would live in a database.
const products = [
    { id: 'p1', name: 'T-Shirt', priceCents: 1999 },
    { id: 'p2', name: 'Jeans', priceCents: 4999 },
    { id: 'p3', name: 'Sneakers', priceCents: 7999 },
    { id: 'p4', name: 'Socks (Pack)', priceCents: 999 },
];
function listProducts() {
    return products;
}
function getProductById(id) {
    return products.find((p) => p.id === id);
}
//# sourceMappingURL=productsStore.js.map