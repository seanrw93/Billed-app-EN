import { screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import  { bills } from "../fixtures/bills.js";
import VerticalLayout from "../views/VerticalLayout.js";


describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    // Mock user in localStorage
    localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
    
    // Render VerticalLayout
    const verticalLayoutHTML = VerticalLayout(120);
    document.addEventListener('DOMContentLoaded', () => {
      document.body.innerHTML = verticalLayoutHTML;
    });
  });

describe("When I am on Bills Page", () => {
    const html = BillsUI({ data: bills })
    beforeEach(() => document.body.innerHTML = html)

    test("Then bill icon in vertical layout should be highlighted", () => {
      document.body.innerHTML = html;
      const icon = screen.getByTestId("icon-window");
      expect(icon).toBeTruthy();
      expect(icon).toHaveClass("active-icon");
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})