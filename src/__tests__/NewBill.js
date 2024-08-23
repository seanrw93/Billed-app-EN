import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import firebase from "../__mocks__/firebase";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then it should not allow files with invalid extensions", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = jest.fn();
      const localStorage = window.localStorage;
      localStorage.setItem("user", JSON.stringify({ email: "test@test.com" }));

      // Create an instance of NewBill
      const newBill = new NewBill({
        document,
        onNavigate,
        firebase,
        localStorage,
      });

      // Mock the file input element and its change event
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
  });
});
