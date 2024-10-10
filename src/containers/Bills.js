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
    const userEmail = localStorage.getItem('user') ?
      JSON.parse(localStorage.getItem('user')).email : "";
    if (this.firestore) {
      return this.firestore
        .bills()
        .get()
        .then(snapshot => {
          const bills = snapshot.docs
            .map(doc => {
              try {
                return {
                  id: doc.id,
                  ...doc.data(),
                  date: formatDate(doc.data().date),
                  status: formatStatus(doc.data().status)
                };
              } catch (e) {
                console.error(e, 'for', doc.data());
                return {
                  id: doc.id,
                  ...doc.data(),
                  date: doc.data().date,
                  status: formatStatus(doc.data().status)
                };
              }
            })
            .filter(bill => bill.email === userEmail);
          return bills;
        })
        .catch(error => {
          console.error('Error fetching bills:', error);
          throw error;
        });
    } else {
      console.log("Firestore is null");
      return Promise.resolve([]);
    }
  };

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