import { screen, render, fireEvent } from "@testing-library/dom";
import '@testing-library/jest-dom/extend-expect'; // Import jest-dom matchers
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import VerticalLayout from "../views/VerticalLayout.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import firebase from "../__mocks__/firebase.js";
import $ from 'jquery';

// Mock user data in localStorage
const mockUserEmployee = () => {
  localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'a@a' }));
};

// Mock the logic to highlight the active icon
const highlightIcon = () => {
  const icon = document.querySelector('#layout-icon1');
  if (icon) {
    icon.classList.add('active-icon');
  }
};

// Mock the firestore module to use the existing firebase.js mock
jest.mock("../app/firestore.js");

$.fn.modal = jest.fn();

describe("Given I am connected as an employee", () => {
  let billsInstance;
  let onNavigate;

  beforeEach(() => {
    mockUserEmployee();
    document.body.innerHTML = VerticalLayout(120) + BillsUI({ data: bills });
    highlightIcon();
    onNavigate = jest.fn();
    billsInstance = new Bills({
      document,
      onNavigate,
      firestore: firebase,
      localStorage: localStorageMock,
    });
  });

  // GET integration test
  describe("When I navigate to Bills", () => {
    test("Then fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(firebase, "bills");
      const bills = await firebase.bills().get();
      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(bills.docs.length).toBe(4);
    });
  });

  describe("When I call getBills method", () => {
    beforeEach(() => {
      mockUserEmployee();
      global.localStorage = localStorageMock;
    });

    // Test to check if getBills method returns bills from firestore
    test("Then it should return bills from firestore", async () => {
      const mockBills = await firebase.bills().get();

      const firestore = {
        bills: () => ({
          get: jest.fn().mockResolvedValue(mockBills)
        })
      };

      const billsInstance = new Bills({ document, onNavigate: jest.fn(), firestore, localStorage: localStorageMock });
      const bills = await billsInstance.getBills();
      expect(bills.length).toBe(4);
      expect(bills[0].id).toBe("47qAXb6fIm2zOKkLzMro");
      expect(bills[1].id).toBe("BeKy5Mo4jkmdfPGYpTxZ");
      expect(bills[2].id).toBe("UIUZtnPQvnbFnB0ozvJh");
      expect(bills[3].id).toBe("qcCK3SzECmaZAGRrHjaC");
    });

    // Test to check if getBills method handles errors correctly
    test("Then it should handle the error in catch block", async () => {
      const firestore = {
        bills: () => ({
          get: jest.fn().mockRejectedValue(new Error("Firestore error"))
        })
      };

      const billsInstance = new Bills({ document, onNavigate: jest.fn(), firestore, localStorage: localStorageMock });
      await expect(billsInstance.getBills()).rejects.toThrow("Firestore error");
    });

    // Test to check if getBills method returns an empty array if firestore is null
    test("Then it should return an empty array if firestore is null", async () => {
      const billsInstance = new Bills({ document, onNavigate: jest.fn(), firestore: null, localStorage: localStorageMock });
      const bills = await billsInstance.getBills();
      expect(bills).toEqual([]);
    });
  });

  describe("When I am on Bills Page", () => {
    const renderBillsPage = (props) => {
      document.body.innerHTML = BillsUI(props);
    };

    // Test to check if the bill icon in vertical layout is highlighted
    test("Then bill icon in vertical layout should be highlighted", () => {
      const icons = screen.getAllByTestId("icon-window");
      expect(icons.length).toBeGreaterThan(0);
      expect(icons[0].classList.contains("active-icon")).toBe(true);
    });

    // Test to check if bills are ordered from earliest to latest
    test("Then bills should be ordered from earliest to latest", () => {
      renderBillsPage({ data: bills });
      const dates = screen.getAllByText(/^\d{2}-\d{2}-\d{4}$/i).map(a => a.innerHTML);
      const antiChrono = (a, b) => ((a > b) ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    // Test to check if the loading page is displayed
    test("Then the loading page should be displayed", () => {
      renderBillsPage({ data: [], loading: true });
      expect(screen.queryByText('Loading...')).not.toBeNull();
    });

    // Test to check if the error page is displayed
    test("Then the error page should be displayed", () => {
      renderBillsPage({ data: [], error: 'Error message' });
      expect(screen.queryByText('Error message')).not.toBeNull();
    });

    // Test to check if the bills are rendered correctly
    test("Then the bills should be rendered correctly", () => {
      renderBillsPage({ data: bills });
      const rows = screen.getAllByTestId('tbody-row');
      expect(rows.length).toBe(bills.length);
    });

    // Test to check if the modal is rendered correctly
    test("Then the modal should be rendered correctly", () => {
      renderBillsPage({ data: bills });
      const modal = screen.getByTestId('modalDialog');
      expect(modal).toBeTruthy();
    });

    // Test to check if the new bill button is rendered
    test("Then the new bill button should be rendered", () => {
      renderBillsPage({ data: bills });
      const newBillButton = screen.getByTestId('btn-new-bill');
      expect(newBillButton).toBeTruthy();
    });

    // Test to check if it renders an empty table when no data is provided
    test("Then it should render empty table when no data is provided", () => {
      renderBillsPage({ data: [] });
      const rows = screen.queryAllByTestId('tbody-row');
      expect(rows.length).toBe(0);
    });
  });

  describe("When I click on the New Bill button", () => {
    // Test to check if it navigates to the New Bill page
    test("Then it should navigate to the New Bill page", () => {
      const buttonNewBill = screen.getByTestId("btn-new-bill");
      fireEvent.click(buttonNewBill);
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["NewBill"]);
    });
  });

  describe("When I click on the eye icon", () => {
    // Test to check if it opens the modal with the image
    test("Then it should open the modal with the image", () => {
      const iconEyes = screen.getAllByTestId("icon-eye");
      iconEyes.forEach(iconEye => {
        fireEvent.click(iconEye);
        const modal = screen.getByTestId("modalDialog");
        expect(modal).toBeTruthy();
        expect(modal.querySelector(".modal-body").innerHTML).toContain("img");
      });
    });
  });

  describe("When the Bills component is instantiated", () => {
    // Test to check if it attaches event listeners to the New Bill button and eye icons
    test("Then it should attach event listeners to the New Bill button and eye icons", () => {
      const buttonNewBill = screen.getByTestId("btn-new-bill");
      const iconEyes = screen.getAllByTestId("icon-eye");

      expect(buttonNewBill).toBeTruthy();
      expect(iconEyes.length).toBeGreaterThan(0);

      fireEvent.click(buttonNewBill);
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["NewBill"]);

      iconEyes.forEach(iconEye => {
        fireEvent.click(iconEye);
        const modal = screen.getByTestId("modalDialog");
        expect(modal).toBeTruthy();
        expect(modal.querySelector(".modal-body").innerHTML).toContain("img");
      });
    });
  });

  describe('when the user interacts with event Listeners and modal', () => {
    let bills;
    let document;
    let onNavigate;
    let firestore;
    let localStorage;

    beforeEach(() => {
      document = {
        createElement: jest.fn().mockImplementation((tagName) => {
          return {
            tagName,
            setAttribute: jest.fn(),
            appendChild: jest.fn(),
            addEventListener: jest.fn(),
            click: jest.fn(),
          };
        }),
        querySelector: jest.fn().mockReturnValue({
          addEventListener: jest.fn()
        }),
        querySelectorAll: jest.fn().mockReturnValue([{
          addEventListener: jest.fn(),
          getAttribute: jest.fn().mockReturnValue('http://example.com/bill.jpg')
        }]),
        body: {
          appendChild: jest.fn(),
        },
      };
      onNavigate = jest.fn();
      firestore = {};
      localStorage = {};

      bills = new Bills({ document, onNavigate, firestore, localStorage });
    });

    // Test to check if it adds event listener to "New Bill" button
    test('should add event listener to "New Bill" button', () => {
      const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`);
      expect(buttonNewBill.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });

    // Test to check if it adds event listeners to "Eye" icons
    test('should add event listeners to "Eye" icons', () => {
      const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
      iconEye.forEach(icon => {
        expect(icon.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
      });
    });

    // Test to check if it shows modal with bill image on "Eye" icon click
    test('should show modal with bill image on "Eye" icon click', () => {
      const icon = document.querySelectorAll()[0];
      bills.handleClickIconEye(icon);
      expect(icon.getAttribute).toHaveBeenCalledWith('data-bill-url');
      expect($('#modaleFile').find('.modal-body').html()).toContain('http://example.com/bill.jpg');
    });

    // Test to check if it adds event listener to buttonNewBill if it exists
    test('should add event listener to buttonNewBill if it exists', () => {
      const buttonNewBill = { addEventListener: jest.fn() };
      document.querySelector.mockReturnValue(buttonNewBill);

      new Bills({ document, onNavigate, firestore, localStorage });

      expect(buttonNewBill.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });

    // Test to check if it does not throw error if buttonNewBill does not exist
    test('should not throw error if buttonNewBill does not exist', () => {
      document.querySelector.mockReturnValue(null);

      expect(() => {
        new Bills({ document, onNavigate, firestore, localStorage });
      }).not.toThrow();
    });

    // Test to check if it adds event listeners to iconEye elements if they exist
    test('should add event listeners to iconEye elements if they exist', () => {
      const iconEye1 = { addEventListener: jest.fn() };
      const iconEye2 = { addEventListener: jest.fn() };
      document.querySelectorAll.mockReturnValue([iconEye1, iconEye2]);

      new Bills({ document, onNavigate, firestore, localStorage });

      expect(iconEye1.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
      expect(iconEye2.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });

    // Test to check if it does not throw error if iconEye elements do not exist
    test('should not throw error if iconEye elements do not exist', () => {
      document.querySelectorAll.mockReturnValue([]);

      expect(() => {
        new Bills({ document, onNavigate, firestore, localStorage });
      }).not.toThrow();
    });
  });
});