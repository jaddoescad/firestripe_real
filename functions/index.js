const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const stripe = require('stripe')('sk_test_G5w1hsC2NqBJNTwdFGTkG3sI')

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.ephemeralKeys_request = functions.https.onRequest((req, res) => {
  const stripe_version = req.body.api_version;
  console.log(stripe_version)

   if (!stripe_version) {
     res.status(400).end();
     return;
   }
   // This function assumes that some previous middleware has determined the
   // correct customerId for the session and saved it on the request object.
   stripe.ephemeralKeys.create(
     {customer: req.body.customerId},
     {stripe_version: stripe_version}
   ).then((key) => {
     res.status(200).json(key);
     return true
   }).catch((err) => {
     console.log(err)
     res.status(500).end();
   });
 });


// When a user is created, register them with Stripe
exports.createStripeCustomer = functions.auth.user().onCreate((user) => {
  console.log('stripe customer registered')
  return stripe.customers.create({
    email: user.email,
  }).then((customer) => {
    return admin.database().ref(`/users/${user.uid}/stripe_id`).set(customer.id);
  });
});

//cus_ETGSsEZwwPWUhN

exports.charge = functions.https.onRequest((req, res) => {
    var customer = req.body.customer;
    var amount = req.body.amount;
    var currency = req.body.currency;
    console.log(customer)
    stripe.charges.create({
      customer: customer,
      amount: amount,
      currency: currency
    }, function(err, charge){
      if (err) {
        console.log(err)
        res.status(500).end();
      } else {
        res.status(200).send();
      }
    })
});
