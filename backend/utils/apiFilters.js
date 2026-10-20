class APIFilters {
  constructor(query, queryStr) { this.query = query; this.queryStr = queryStr; }
  search() {
    const keyword = String(this.queryStr.keyword || "").trim().slice(0,120).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (keyword) this.query = this.query.find({ $or: [{ name: { $regex: keyword, $options: "i" } }, { description: { $regex: keyword, $options: "i" } }] });
    return this;
  }
  filters() {
    const filter = {};
    const category = String(this.queryStr.category || "").slice(0,100);
    if (category) filter.$and = [{ $or: [{ "category.main": category }, { "category.sub": category }] }];
    for (const field of ["price", "ratings"]) {
      for (const op of ["gte", "lte"]) {
        const value = this.queryStr[field]?.[op] ?? this.queryStr[`${field}[${op}]`];
        if (value !== undefined && Number.isFinite(Number(value)) && Number(value) >= 0) { filter[field] ||= {}; filter[field][`$${op}`] = Number(value); }
      }
    }
    if (this.queryStr.listingType === "retail") { filter.listingType = { $ne: "property" }; filter["category.main"] = { $ne: "Property or Real Estate" }; }
    if (this.queryStr.listingType === "property") filter.listingType = "property";
    if (this.queryStr.inStock === "true") filter.stock = { $gt: 0 };
    const sort = { newest: { createdAt: -1, _id: -1 }, priceAsc: { price: 1, _id: 1 }, priceDesc: { price: -1, _id: 1 }, rating: { ratings: -1, _id: -1 } };
    this.query = this.query.find(filter).sort(sort[this.queryStr.sort] || sort.newest);
    return this;
  }
  pagination(size) { const page = Math.max(1, Math.min(100000, Math.floor(Number(this.queryStr.page) || 1))); this.query = this.query.limit(size).skip(size*(page-1)); return this; }
}
export default APIFilters;
