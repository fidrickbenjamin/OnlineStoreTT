class APIFilters {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        const rawKeyword = this.queryStr.keyword;

        if (!rawKeyword || !String(rawKeyword).trim()) {
            this.query = this.query.find({});
            return this;
        }

        const keyword = String(rawKeyword).trim();
        const keywordRegex = {
            $regex: keyword,
            $options: "i",
        };

        const searchConditions = [
            { name: keywordRegex },
            { description: keywordRegex },
        ];

        const numericKeyword = Number(keyword);
        if (!Number.isNaN(numericKeyword)) {
            searchConditions.push({ price: numericKeyword });
        }

        this.query = this.query.find({ $or: searchConditions });
        return this;
    }

filters() {
    const queryCopy = { ...this.queryStr };

   // Fields to remove
   const fieldsToRemove = ["keyword", "page"];
   fieldsToRemove.forEach((el) => delete queryCopy[el]);

   let filterQuery = {};
   const categoryValue = queryCopy.category;

   if (categoryValue) {
       delete queryCopy.category;
       filterQuery = {
           ...queryCopy,
           $or: [
               { "category.main": categoryValue },
               { "category.sub": categoryValue },
               { category: categoryValue },
           ],
       };
   } else {
       filterQuery = queryCopy;
   }

   // Advance Filter for Price, Ratings, ets
   let queryStr = JSON.stringify(filterQuery);
   queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

   this.query = this.query.find(JSON.parse(queryStr));
   return this;
}

pagination(resPerPage) { 

    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resPerPage * (currentPage - 1 );

    this.query = this.query.limit(resPerPage).skip(skip);
    return this;

}

}


export default APIFilters;