# Paginated-Data-Table

- [Paginated-Data-Table](#paginated-data-table)
  - [Introduction](#introduction)
  - [TechStack](#techstack)

## Introduction
<img width="960" alt="Screenshot 2024-09-15 235836" src="https://github.com/user-attachments/assets/d62a1160-4c4f-4dde-b1e0-3ed25a4ff07e">

This is an implementation example of using Prime React DataTable to render data fetched from an API. The application uses a custom logic for row selection.

Salient Features:

1. Pagination of API data with each page showing maximum of 12 rows.
2. Data is lazily loaded on each page by making call to server and not kept in memory on page change.
3. Users can select rows in 3 ways:
   - Users can direct use checkbox on each row to select/unselect.
   - Users can use Select All checkbox on top of the page to select/unselect all rows on the same page.
   - Users can use a custom selection panel on top left of the page to input number of rows to select starting from current page.
4. User's row selections/de-selections are maintained on page change.

The website is hosted on Netlify and can be accessed [https://paginated-data-table.netlify.app/](https://paginated-data-table.netlify.app/).

## TechStack

- Library: ReactJS with TypeScript built using Vite.
- Used [React Icons](https://react-icons.github.io/react-icons/) for Chevron icon.
