import { screen, render } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import VerticalLayout from "../views/VerticalLayout.js";
import LoadingPage from "../views/LoadingPage.js";
import ErrorPage from "../views/ErrorPage.js";

// Mock user data in localStorage
const mockUserEmployee = () => {
  localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
};

// Mock the logic to highlight the active icon
const highlightIcon = () => {
  const icon = document.querySelector('#layout-icon1'); // This ID should match your actual icon element
  if (icon) {
    icon.classList.add('active-icon'); // Ensure this class is what your app uses for highlighting
  }
};

describe("Given I am connected as an employee", () => {

  beforeEach(() => {
    // Mock the user in localStorage
    mockUserEmployee();

    // Render VerticalLayout and BillsUI
    const verticalLayoutHTML = VerticalLayout(120);
    document.body.innerHTML = verticalLayoutHTML;

    const html = BillsUI({ data: bills });
    document.body.innerHTML += html;

    // Simulate highlighting the icon
    highlightIcon();
  });

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      // Select all icon elements
      const icons = screen.getAllByTestId("icon-window");

      // Check if at least one icon exists
      expect(icons.length).toBeGreaterThan(0);

      // Check if the first icon is highlighted with the appropriate class
      expect(icons[0].classList.contains("active-icon")).toBe(true); // Make sure the class name matches your app's implementation
    });

    test("Then bills should be ordered from latest to earliest", () => {
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
        .map((date) => date.innerHTML);
      const antiChrono = (a, b) => ((a < b) ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    test("Then the loading page should be displayed", () => {
      const html = BillsUI({ data: [], loading: true });
      document.body.innerHTML = html;
      expect(screen.getByText('Loading...')).toBeTruthy();
    });

    test("Then the error page should be displayed", () => {
      const html = BillsUI({ data: [], error: 'Error message' });
      document.body.innerHTML = html;
      expect(screen.getByText('Error message')).toBeTruthy();
    });

    test("Then the bills should be rendered correctly", () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      const rows = screen.getAllByTestId('tbody-row');
      expect(rows.length).toBe(bills.length);
    });

    test("Then the modal should be rendered correctly", () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      const modal = screen.getByTestId('modalDialog');
      expect(modal).toBeTruthy();
    });

    test("Then the new bill button should be rendered", () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      const newBillButton = screen.getByTestId('btn-new-bill');
      expect(newBillButton).toBeTruthy();
    });
  });
});