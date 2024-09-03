import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class Bills {
  constructor({ document, onNavigate, firestore, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.firestore = firestore

    // Add event listener for the "New Bill" button
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)

    // Add event listeners for the "Eye" icons
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye.length > 0) iconEye.forEach(icon => {
      icon.addEventListener('click', (e) => this.handleClickIconEye(icon))
    })
    

    // Initialize Logout
    new Logout({ document, localStorage, onNavigate })
  }

  getBills = () => {
    return this.firestore
      .bills()
      .get()
      .then(snapshot => {
        const bills = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        return bills;
      })
      .catch(error => {
        throw error;
      });
  }

  // Handle click event for "New Bill" button
  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  // Handle click event for "Eye" icon
  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class='bill-proof-container'><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    $('#modaleFile').modal('show')
  }
}