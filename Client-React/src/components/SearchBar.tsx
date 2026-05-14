import React from "react";
import "../styles/SearchBar.css";

const SearchIcon: React.FC = () => (
  <svg
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
  >
    <g transform="translate(0,512) scale(0.1,-0.1)">
      <path
        d="M1851 5109 c-657 -74 -1219 -432 -1555 -989 -138 -229 -223 -463
-273 -745 -26 -151 -23 -500 5 -655 120 -657 508 -1187 1087 -1487 310 -160
591 -228 945 -227 431 0 785 107 1145 345 l119 79 696 -693 c469 -468 708
-700 735 -713 54 -25 167 -25 215 0 120 63 175 193 135 317 -17 51 -54 91
-717 755 l-699 701 77 114 c371 548 453 1234 222 1869 -75 208 -219 450 -375
631 -260 300 -628 533 -1005 634 -230 62 -542 89 -757 64z m357 -510 c380 -41
677 -182 943 -448 271 -271 415 -579 451 -963 32 -343 -60 -693 -263 -998 -84
-127 -282 -325 -409 -409 -512 -341 -1143 -359 -1664 -47 -376 224 -641 602
-728 1039 -32 160 -32 414 0 574 90 451 367 835 767 1062 267 152 604 223 903
190z"
      />
    </g>
  </svg>
);

const FilterIcon: React.FC = () => (
  <svg
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
  >
    <g transform="translate(0,512) scale(0.1,-0.1)">
      <path
        d="M747 4469 c-162 -38 -297 -178 -337 -348 -24 -103 4 -245 68 -339 15
-22 363 -410 774 -862 l748 -822 2 -798 c3 -789 3 -799 24 -826 49 -67 130
-91 195 -60 19 9 221 166 449 349 299 239 420 342 432 367 16 32 18 77 18 502
l0 466 663 729 c364 401 707 778 761 838 110 122 151 194 169 300 29 171 -60
360 -214 452 -112 67 11 63 -1944 62 -1002 -1 -1786 -5 -1808 -10z m3580 -326
c50 -23 80 -91 64 -143 -8 -27 -204 -250 -782 -886 -424 -467 -778 -860 -788
-874 -14 -21 -17 -80 -21 -494 l-5 -469 -230 -188 c-126 -103 -233 -188 -237
-188 -5 -1 -8 290 -8 647 -1 591 -2 650 -18 678 -9 18 -361 411 -782 874 -421
463 -773 856 -782 873 -34 60 -15 131 45 167 31 20 64 20 1770 20 1607 0 1742
-1 1774 -17z"
      />
    </g>
  </svg>
);

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterActive: boolean;
  onFilterToggle: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  filterActive,
  onFilterToggle,
}) => {
  return (
    <div className="search-bar-wrapper">
      <div className="search-bar-field">
        <span className="search-bar-icon">
          <SearchIcon />
        </span>
        <input
          type="text"
          className="search-bar-input"
          placeholder="Пошук за назвою"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <button
        type="button"
        className={`search-bar-filter-btn${filterActive ? " active" : ""}`}
        onClick={onFilterToggle}
        title="Фільтри"
        aria-label="Відкрити фільтри"
      >
        <FilterIcon />
      </button>
    </div>
  );
};

export default SearchBar;
