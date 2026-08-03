import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Search = () => {

    const [keyword, setKeyword] = useState("");
    const navigate = useNavigate();
    const [, setSearchParams] = useSearchParams();

    const submitHandler = (e) => {
        e.preventDefault();

        const trimmedKeyword = keyword?.trim();
        const nextParams = new URLSearchParams();

        if (trimmedKeyword) {
            nextParams.set("keyword", trimmedKeyword);
            nextParams.set("skipSplash", "true");
            setSearchParams(nextParams);
            navigate(`/?${nextParams.toString()}`);
        } else {
            nextParams.delete("keyword");
            nextParams.set("skipSplash", "true");
            setSearchParams(nextParams);
            navigate(`/?${nextParams.toString()}`);
        }
    };

    return (
        <form onSubmit={submitHandler} className="search-form">
            <div className="input-group">
                <input
                    type="text"
                    id="search_field"
                    aria-describedby="search_btn"
                    className="form-control search-input"
                    placeholder="Search products by name, description or price"
                    name="keyword"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
                <button id="search_btn" className="btn" type="submit">
                    <i className="bi bi-search"  aria-hidden="true"></i>    
                </button>
            </div>
        </form>
    );
};

export default Search;
