import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./styles.module.scss";
const App = () => {
  const [countries, setCountries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [countriesPerPage, setCountriesPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterSmallerThanLtu, setFilterSmallerThanLtu] = useState(false);
  const [ltuArea, setLtuArea] = useState(null);
  const [filterOceania, setFilterOceania] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/countries");
        const lithuania = response.data.find(
          (country) => country.name === "Lithuania"
        );
        if (lithuania) {
          setLtuArea(lithuania.area);
        }
        let filteredCountries = filterCountries(
          response.data,
          filterSmallerThanLtu,
          lithuania?.area,
          filterOceania
        );
        filteredCountries = sortCountries(filteredCountries, sortOrder);
        setCountries(filteredCountries);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchCountries();
  }, [sortOrder, filterSmallerThanLtu, filterOceania]);

  const sortCountries = (countries, order) => {
    return countries.sort((a, b) => {
      if (order === "asc") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
  };

  const filterCountries = (
    countries,
    filterSmaller,
    lithuaniaArea,
    filterOceania
  ) => {
    let filtered = countries;
    if (filterSmaller && lithuaniaArea) {
      filtered = filtered.filter((country) => country.area < lithuaniaArea);
    }
    if (filterOceania) {
      filtered = filtered.filter((country) => country.region === "Oceania");
    }
    return filtered;
  };

  const indexOfLastCountry = currentPage * countriesPerPage;
  const indexOfFirstCountry = indexOfLastCountry - countriesPerPage;
  const currentCountries = countries.slice(
    indexOfFirstCountry,
    indexOfLastCountry
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(countries.length / countriesPerPage);

  const handleItemsPerPageChange = (e) => {
    setCountriesPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterSmallerThanLtu(e.target.checked);
  };

  const handleFilterOceaniaChange = (e) => {
    setFilterOceania(e.target.checked);
  };

  return (
    <div className={styles.parentContainer}>
      <h1>Country List</h1>
      <div className={styles.sortContainer}>
        <label htmlFor="countriesPerPage">Countries per page: </label>
        <select
          id="countriesPerPage"
          value={countriesPerPage}
          onChange={handleItemsPerPageChange}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <label htmlFor="sortOrder">Sort order: </label>
        <select
          id="sortOrder"
          value={sortOrder}
          onChange={handleSortOrderChange}
        >
          <option value="asc">Ascending (A-Z)</option>
          <option value="desc">Descending (Z-A)</option>
        </select>
      </div>

      <div className={styles.filterContainer}>
        <label htmlFor="filterSmallerThanLithuania">
          <input
            type="checkbox"
            id="filterSmallerThanLithuania"
            checked={filterSmallerThanLtu}
            onChange={handleFilterChange}
          />
          Show countries that are smaller than Lithuania
        </label>
        <label htmlFor="filterOceania">
          <input
            type="checkbox"
            id="filterOceania"
            checked={filterOceania}
            onChange={handleFilterOceaniaChange}
          />
          Show countries in Oceania
        </label>
      </div>

      <ul>
        {currentCountries.length > 0 ? (
          currentCountries.map((country) => (
            <li key={country.name}>
              {country.name} - {country.region} - {country.area} km²
            </li>
          ))
        ) : (
          <li>No countries available</li>
        )}
      </ul>
      <div className={styles.pagesContainer}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
          <button
            className={styles.pageButton}
            key={number}
            onClick={() => paginate(number)}
          >
            {number}
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
