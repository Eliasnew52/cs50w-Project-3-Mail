document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  //Submit
  document.querySelector("#compose-form").addEventListener('submit', send_email)

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-detail').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function view_email(id) {
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      console.log(email);

      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#emails-detail').style.display = 'block';

      document.querySelector('#emails-detail').innerHTML = `
      <ul class="list-group">
        <li class="list-group-item"><strong>From:</strong>${email.sender}</li>
        <li class="list-group-item"><strong>To:</strong>${email.recipients}</li>
        <li class="list-group-item"><strong>Subject:</strong>${email.subject}</li>
        <li class="list-group-item"><strong>Timestamp:</strong>${email.timestamp}</li>
        <li class="list-group-item">${email.body}</li>
      </ul>
      `
      //Check whether a Mail is Read or Not
      if (!email.read) {
        fetch(`emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        })
      }

      //Archive - UnArchive JS
      const Arch_Btn = document.createElement('button');
      Arch_Btn.innerHTML = email.archived ? "Unarchive" : "Archive";
      Arch_Btn.className = email.archived ? "btn btn-success m-3" : "btn btn-warning m-3";
      Arch_Btn.addEventListener('click', function () {
        console.log("This Button has been Clicked")
        fetch(`emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: !email.archived
          })
        })
          .then(() => { load_mailbox('archive') })
      });
      document.querySelector('#emails-detail').append(Arch_Btn);

      //Reply
      const Reply_Btn = document.createElement('button');
      Reply_Btn.innerHTML = "Reply";
      Reply_Btn.className = "btn btn-info m-3";
      Reply_Btn.addEventListener('click', function () {
        console.log("reply")
        compose_email();

        document.querySelector('#compose-recipients').value = email.sender;
        let subject = email.subject;
        if(subject.split('',1)[0] != "Re:"){
          subject = "Re:" + email.subject;
        }
        document.querySelector('#compose-subject').value = subject ;
        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} Wrote ${email.body}`;


      });
      document.querySelector('#emails-detail').append(Reply_Btn);
    })

}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-detail').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //Retrieve Mails for Mailbox
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      //Mail Creation
      // Sender - Subject - Timestamp
      emails.forEach(mail => {
        console.log(mail);

        //Element Creation
        const newMail = document.createElement('div');
        newMail.className = "list-group-item my-3 mx-2";
        newMail.innerHTML = `
        <h5>From: ${mail.sender}</h5>
        <p>Subject: ${mail.subject}</p>
        <p>${mail.timestamp}</p>
      `;

        //BG Color (if read is true, we use it, else, we working with unread)
        newMail.classList.add(mail.read ? 'read' : 'unread');

        //Click event
        newMail.addEventListener('click', function () {
          view_email(mail.id)
        });
        document.querySelector('#emails-view').append(newMail);
      })
    })

}

function send_email(event) {
  event.preventDefault();

  //Store Fields Content
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  //Backend Data Send
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
    .then(response => response.json())
    .then(result => {
      //Checking response on log
      console.log(result);
      load_mailbox('sent');
    });
}

