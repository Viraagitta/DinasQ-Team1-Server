const router = require("express").Router();
const ReimbursementController = require("../controllers/ReimbursementController");

router.get("/reimbursements", ReimbursementController.getReimbursements);
 // get all reimbursements

router.get("/reimbursements/pdf/:id", ReimbursementController.getPdf)

router.get("/reimbursements/:id", ReimbursementController.getReimbursementById);
// get reimbursement by id

router.post("/reimbursements", ReimbursementController.createReimbursement);
// create new reimbursement

router.patch(
  "/reimbursements/:id",
  ReimbursementController.updateStatusReimbursement
);
// update reimbursement status

module.exports = router;


