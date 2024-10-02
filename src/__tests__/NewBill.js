import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import firebase from "../__mocks__/firebase";
import { ROUTES_PATH } from "../constants/routes";

// Mocking Firebase storage and firestore
jest.mock('firebase', () => ({
  storage: () => ({
    ref: () => ({
      put: jest.fn(() =>
        Promise.resolve({
          ref: {
            getDownloadURL: jest.fn(() => Promise.resolve('https://mockurl.com')),
          },
        })
      ),
    }),
  }),
  firestore: {
    bills: jest.fn(() => ({
      add: jest.fn(() => Promise.resolve()),
    })),
  },
}));

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    let newBill;
    let onNavigate;

    beforeEach(() => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      onNavigate = jest.fn();
      const localStorage = window.localStorage;
      localStorage.setItem("user", JSON.stringify({ email: "test@test.com" }));

      // Create an instance of NewBill
      newBill = new NewBill({
        document,
        onNavigate,
        firestore: firebase.firestore, // Ensure firestore is correctly passed
        localStorage,
      });
    });

    test("Then it should not allow files with invalid extensions", () => {
      const inputFileType = screen.getByTestId("file");

      // Create a file with an invalid extension
      const invalidFile = new File(["file content"], "invalid-file.gif", {
        type: "image/gif",
      });

      // Simulate a change event with the invalid file
      fireEvent.change(inputFileType, {
        target: {
          files: [invalidFile],
        },
      });

      // Assert that the input value is cleared (meaning the file was rejected)
      expect(inputFileType.value).toBe("");
    });

    test("Then it should submit the form and create a new bill", async () => {
      const form = screen.getByTestId("form-new-bill");
    
      // Set form values
      fireEvent.change(screen.getByTestId("expense-type"), {
        target: { value: "Travels" }, // Ensure this matches one of the options
      });
      fireEvent.change(screen.getByTestId("expense-name"), {
        target: { value: "Test Expense" },
      });
      fireEvent.change(screen.getByTestId("amount"), {
        target: { value: "100" },
      });
      fireEvent.change(screen.getByTestId("datepicker"), {
        target: { value: "2023-10-10" },
      });
      fireEvent.change(screen.getByTestId("vat"), {
        target: { value: "20" },
      });
      fireEvent.change(screen.getByTestId("pct"), {
        target: { value: "20" },
      });
      fireEvent.change(screen.getByTestId("commentary"), {
        target: { value: "Test commentary" },
      });
    
      // Mock the createBill method
      newBill.createBill = jest.fn();
    
      // Simulate file upload
      newBill.fileUrl = "https://mockurl.com";
      newBill.fileName = "valid-file.jpg";
    
      // Assert that the fileUrl and fileName are set correctly
      expect(newBill.fileUrl).toBe("https://mockurl.com");
      expect(newBill.fileName).toBe("valid-file.jpg");

      // Submit the form
      fireEvent.submit(form);
    
      // Wait for form submission
      await new Promise(process.nextTick);
    
      // Assert that createBill was called with the correct data
      expect(newBill.createBill).toHaveBeenCalledWith({
        email: "test@test.com",
        type: "Travels", // Ensure this matches the selected value
        name: "Test Expense",
        amount: 100,
        date: "2023-10-10",
        vat: "20",
        pct: 20,
        commentary: "Test commentary",
        fileUrl: "https://mockurl.com",
        fileName: "valid-file.jpg",
        status: "pending",
      });
    });

    test("Then it should handle form submission without a file", async () => {
      const form = screen.getByTestId("form-new-bill");

      // Set form values
      fireEvent.change(screen.getByTestId("expense-type"), {
        target: { value: "Travels" },
      });
      fireEvent.change(screen.getByTestId("expense-name"), {
        target: { value: "Test Expense" },
      });
      fireEvent.change(screen.getByTestId("amount"), {
        target: { value: "100" },
      });
      fireEvent.change(screen.getByTestId("datepicker"), {
        target: { value: "2023-10-10" },
      });
      fireEvent.change(screen.getByTestId("vat"), {
        target: { value: "20" },
      });
      fireEvent.change(screen.getByTestId("pct"), {
        target: { value: "20" },
      });
      fireEvent.change(screen.getByTestId("commentary"), {
        target: { value: "Test commentary" },
      });

      // Mock the createBill method
      newBill.createBill = jest.fn();

      // Submit the form without setting fileUrl and fileName
      fireEvent.submit(form);

      // Wait for form submission
      await new Promise(process.nextTick);

      // Assert that createBill was called with the correct data
      expect(newBill.createBill).toHaveBeenCalledWith({
        email: "test@test.com",
        type: "Travels",
        name: "Test Expense",
        amount: 100,
        date: "2023-10-10",
        vat: "20",
        pct: 20,
        commentary: "Test commentary",
        fileUrl: null,
        fileName: null,
        status: "pending",
      });
    });

    test("Then it should handle file change with invalid file", async () => {
      const inputFileType = screen.getByTestId("file");

      // Create a file with an invalid extension
      const invalidFile = new File(["file content"], "invalid-file.gif", {
        type: "image/gif",
      });

      // Simulate a change event with the invalid file
      fireEvent.change(inputFileType, {
        target: {
          files: [invalidFile],
        },
      });

      // Assert that the input value is cleared (meaning the file was rejected)
      expect(inputFileType.value).toBe("");
    });

    test("Then it should initialize with correct default values", () => {
      expect(newBill.fileUrl).toBe(null);
      expect(newBill.fileName).toBe(null);
    });

    test("Then it should call onNavigate when createBill is successful", async () => {
      const bill = {
        email: "test@test.com",
        type: "Travels",
        name: "Test Expense",
        amount: 100,
        date: "2023-10-10",
        vat: "20",
        pct: 20,
        commentary: "Test commentary",
        fileUrl: "https://mockurl.com",
        fileName: "valid-file.jpg",
        status: "pending",
      };

      newBill.createBill(bill);

      // Wait for createBill to complete
      await new Promise(process.nextTick);

      // Assert that onNavigate was called
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
    });

    // New tests to increase coverage
    test("Then it should handle errors during file upload", async () => {
      const inputFileType = screen.getByTestId("file");

      // Mock the put method to reject
      firebase.storage().ref().put.mockImplementationOnce(() =>
        Promise.reject(new Error("File upload error"))
      );

      // Create a file with a valid extension
      const validFile = new File(["file content"], "valid-file.jpg", {
        type: "image/jpeg",
      });

      // Simulate a change event with the valid file
      fireEvent.change(inputFileType, {
        target: {
          files: [validFile],
        },
      });

      // Wait for the file upload process to complete
      await new Promise(process.nextTick);

      // Assert that the fileUrl and fileName are not set
      expect(newBill.fileUrl).toBe(null);
      expect(newBill.fileName).toBe(null);
    });
  });
});