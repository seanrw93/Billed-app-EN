import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, firestore, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.firestore = firestore
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit.bind(this))
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile.bind(this))
    this.fileUrl = null
    this.fileName = null
    new Logout({ document, localStorage, onNavigate })
  }

  handleChangeFile = async (e) => {
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    const filePath = e.target.value.split(/\\/g)
    const fileName = filePath[filePath.length - 1]
    const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;

    if (!fileName.match(allowedExtensions)) {
      e.target.value = '';
      alert('Only jpg, jpeg and png files are allowed');
      return;
    }

    try {
      const snapshot = await this.firestore.storage.ref(`justificatifs/${fileName}`).put(file);
      const url = await snapshot.ref.getDownloadURL();
      this.fileUrl = url;
      this.fileName = fileName;
    } catch (error) {
      console.error('File upload error:', error);
      this.fileUrl = null;
      this.fileName = null;
    }
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    const email = JSON.parse(localStorage.getItem("user")).email;
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    };

    if (!bill.type || !bill.name || isNaN(bill.amount) || !bill.date || !bill.vat || !bill.pct || !bill.commentary) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await this.createBill(bill)
      this.onNavigate(ROUTES_PATH['Bills'])
    } catch (e) {
      console.error("Form submission error", e)
    }
  }

  // no need to cover this function by tests
  createBill = (bill) => {
    if (this.firestore) {
      return this.firestore // Added return to ensure a promise is returned
        .bills()
        .add(bill)
        .then(() => {
          this.onNavigate(ROUTES_PATH['Bills']);
        })
        .catch(error => {
          console.error("Create bill error:", error);
          throw error; // Re-throw the error to ensure it's caught in tests
        });
    }
    return Promise.resolve(); // Ensure it returns a promise even if this.firestore is undefined
  }
  
}