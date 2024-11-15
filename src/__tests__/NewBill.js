import { screen, fireEvent, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import Bills from "../containers/Bills.js";
import firebase from "../__mocks__/firebase";  
import { ROUTES_PATH } from "../constants/routes";

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
        firestore: firebase, 
        localStorage,
      });
    });

    describe("When I upload a file with an invalid extension", () => {
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

      test("Then it should alert the user about invalid file type", async () => {
        // Mock alert
        window.alert = jest.fn();
    
        const inputFile = screen.getByTestId("file");
    
        // Create an invalid file (e.g., GIF format)
        const invalidFile = new File(["content"], "invalid-file.gif", { type: "image/gif" });
    
        // Simulate file upload with invalid file type
        fireEvent.change(inputFile, {
          target: { files: [invalidFile] },
        });
    
        // Check if alert was called with the correct message
        expect(window.alert).toHaveBeenCalledWith("Only jpg, jpeg and png files are allowed");
      });
    });

    describe("When I submit the form with valid inputs", () => {
      test("Then it should submit the form and create a new bill", async () => {
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
        });
      });
    });

    test("Then it should handle form submission error", async () => {
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
    
      // Mock the createBill method to throw an error
      newBill.createBill = jest.fn(() => {
        throw new Error("Form submission error");
      });
    
      // Simulate form submission
      fireEvent.submit(form);
    
      // Wait for form submission
      await new Promise(process.nextTick);
    
      // Assert that createBill was called
      expect(newBill.createBill).toHaveBeenCalled();
    });

    describe("When I submit the form without a file", () => {
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
    });

    describe("When I submit the form with missing required fields", () => {
      test("Then it should not submit the form and display an alert", () => {
        // Mock alert
        window.alert = jest.fn();
    
        const form = screen.getByTestId("form-new-bill");
    
        // Set invalid form values (leave fields empty or invalid)
        fireEvent.change(screen.getByTestId("expense-type"), {
          target: { value: "" },
        });
        fireEvent.change(screen.getByTestId("expense-name"), {
          target: { value: "" },
        });
        fireEvent.change(screen.getByTestId("amount"), {
          target: { value: "" },
        });
    
        newBill.createBill = jest.fn();
    
        fireEvent.submit(form);
    
        // Check that alert was displayed
        expect(window.alert).toHaveBeenCalledWith("Please fill in all required fields");
      });
    });
    

    describe("When I handle form submission with invalid data", () => {
      test("Then it should not submit the form", async () => {
        const form = screen.getByTestId("form-new-bill");

        // Set form values with invalid data
        fireEvent.change(screen.getByTestId("expense-type"), {
          target: { value: "" },
        });
        fireEvent.change(screen.getByTestId("expense-name"), {
          target: { value: "" },
        });
        fireEvent.change(screen.getByTestId("amount"), {
          target: { value: "" },
        });
        fireEvent.change(screen.getByTestId("datepicker"), {
          target: { value: "" },
        });
        fireEvent.change(screen.getByTestId("vat"), {
          target: { value: "" },
        });
        fireEvent.change(screen.getByTestId("pct"), {
          target: { value: "" },
        });
        fireEvent.change(screen.getByTestId("commentary"), {
          target: { value: "" },
        });

        // Mock the createBill method
        newBill.createBill = jest.fn();

        // Submit the form
        fireEvent.submit(form);

        // Wait for form submission
        await new Promise(process.nextTick);

        // Assert that createBill was not called
        expect(newBill.createBill).not.toHaveBeenCalled();
      });
    });

    describe("When a new bill is successfully created", () => {
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

      test("Then it should handle an error if adding fails", async () => {
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
    
        // Mock firestore add method to reject
        newBill.firestore.bills = jest.fn().mockReturnValue({
          add: jest.fn(() => Promise.reject(new Error("Create bill error")))
        });
    
        await expect(newBill.createBill(bill)).rejects.toThrow("Create bill error");
      });
    });

    describe("When I call createBill", () => {
      test("Then it should handle createBill error", async () => {
        // Mock the add method to throw an error
        newBill.firestore.bills().add.mockImplementationOnce(() => {
          throw new Error("Create bill error");
        });
    
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
    
        // Call the createBill method
        try {
          await newBill.createBill(bill);
        } catch (error) {
          // Assert that the error is caught
          expect(error).toEqual(new Error("Create bill error"));
        }
      });
    });

    describe("When the form is initialized", () => {
      test("Then it should initialize with correct default values", () => {
        expect(newBill.fileUrl).toBe(null);
        expect(newBill.fileName).toBe(null);
      });
    });

    //Post integration test
    describe("When I submit the form with valid inputs", () => {
      test("Then it should make a POST request to create a new bill", async () => {
        // Create a mock for Firestore's add method
        const addMock = jest.fn(() => Promise.resolve("billCreated")); // Mock the success response
    
        // Mock the Firestore 'bills' collection's 'add' method
        newBill.firestore.bills = jest.fn(() => ({
          add: addMock,
        }));
    
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
    
        // Mock the file upload
        newBill.fileUrl = "https://mockurl.com";
        newBill.fileName = "valid-file.jpg";
    
        // Submit the form
        fireEvent.submit(form);
    
        // Wait for form submission
        await new Promise(process.nextTick);
    
        // Assert that Firestore's 'add' method was called with the correct data
        expect(addMock).toHaveBeenCalledWith({
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
        });
    
        // Assert that onNavigate was called with the correct route
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
      });
    });
    
  });
});
