document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  //Submit
  document.querySelector("#compose-form").addEventListener('submit',send_email)

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //Retrieve Mails for Mailbox
  fetch(`/emails/${mailbox}`)
  .then(response=> response.json())
  .then(emails => {
    //Mail Creation
    emails.forEach(mail => {
      //Element Creation
      const newMail = document.createElement('div');
      newMail.innerHTML = "This is the content";
      newMail.addEventListener('click', function(){
        console.log('This NewMail got clicked ')
      });
      document.querySelector('#emails-view').append(newMail);
    })
  })
}

function send_email(event){
  event.preventDefault();

  //Store Fields Content
  const recipients = document.querySelector('#compose-recipients').value;
  const subject =document.querySelector('#compose-subject').value ;
  const body =document.querySelector('#compose-body').value;

  //Backend Data Send
  fetch('/emails',{
    method:'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject:subject,
      body:body
    })
  })
  .then(response => response.json())
  .then(result =>{
    //Checking response on log
    console.log(result);
    load_mailbox('sent');
  });
}