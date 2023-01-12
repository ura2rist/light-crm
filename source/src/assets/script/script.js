import fetchApi from './fetchApi';

window.addEventListener('DOMContentLoaded', () => {
  let clientArray = [];
  const search = document.getElementById('header__search');
  const sortButton = document.querySelectorAll('.people__table-button');
  const loaderTable = document.querySelector('.people__table-preloader');
  const add = document.getElementById('people__add');
  const modal = document.getElementById('modal');
  const surnameTemp = document.querySelector('#form-surname');
  const nameTemp = document.querySelector('#form-name');
  const lastNameTemp = document.querySelector('#form-lastname');
  const titleTemp = document.querySelector('#title');
  const cancelTemp = document.querySelector('#cancel');
  const saveTemp = document.querySelector('#save');
  const removeTemp = document.querySelector('#remove');
  const addContactTemp = document.querySelector('#addContact');
  const newContactTemp = document.querySelector('#newContact');
  const newContactInputTemp = document.querySelector('#newContactInput');
  const modalContent = modal.querySelector('.modal__content');

  function allTable() {
    fetchApi.getClients().then((result) => {
      loaderTable.style.display = 'none';
      add.disabled = false;

      clientArray = result;

      viewClients(clientArray);
    });
  }

  allTable();

  search.addEventListener('input', (event) => {
    clearTable();

    loaderTable.style.display = 'block';

    if(event.currentTarget.value.trim() === '') {
      allTable();
    } else {
      fetchApi.searchClient(event.currentTarget.value.trim())
        .then((response) => {
          loaderTable.style.display = 'none';

          clientArray = response;

          viewClients(clientArray);
        });
    }
  });

  sortButton.forEach((button) => {
    button.addEventListener('click', (event) => {
      clearTable();

      event.currentTarget.classList.toggle('people__table-button_active');

      if(event.currentTarget.dataset.sort === 'id') {
        if(event.currentTarget.classList.contains('people__table-button_active')) {
          clientArray.sort((a, b) => b.id - a.id);
        } else {
          clientArray.sort((a, b) => a.id - b.id);
        }
      } else if(event.currentTarget.dataset.sort === 'fio') {
        if(event.currentTarget.classList.contains('people__table-button_active')) {
          clientArray.sort((a, b) => {
            const nameA = a.name.toLowerCase() + ' ' + a.surname.toLowerCase() + ' ' + a.lastName.toLowerCase();
            const nameB = b.name.toLowerCase() + ' ' + b.surname.toLowerCase() + ' ' + b.lastName.toLowerCase();
      
            if (nameA < nameB) return -1
            if (nameA > nameB) return 1
      
            return 0 
          });      
        } else {
          clientArray.sort((a, b) => {
            const nameA = a.name.toLowerCase() + ' ' + a.surname.toLowerCase() + ' ' + a.lastName.toLowerCase();
            const nameB = b.name.toLowerCase() + ' ' + b.surname.toLowerCase() + ' ' + b.lastName.toLowerCase();
      
            if (nameA < nameB) return 1
            if (nameA > nameB) return -1
      
            return 0 
          }); 
        }
      } else if(event.currentTarget.dataset.sort === 'create') {
        if(event.currentTarget.classList.contains('people__table-button_active')) {
          clientArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else {
          clientArray.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }
      } else if(event.currentTarget.dataset.sort === 'update') {
        if(event.currentTarget.classList.contains('people__table-button_active')) {
          clientArray.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        } else {
          clientArray.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
        }
      }

      viewClients(clientArray);

      loaderTable.style.display = 'none';
    });
  });



  add.addEventListener('click', function() {
    const surname = surnameTemp.content.cloneNode(true);
    const name = nameTemp.content.cloneNode(true);
    const lastName = lastNameTemp.content.cloneNode(true);
    const title = titleTemp.content.cloneNode(true);
    const cancel = cancelTemp.content.cloneNode(true);
    const addContact = addContactTemp.content.cloneNode(true);
    const save = saveTemp.content.cloneNode(true);

    title.querySelector('h2').textContent = 'Новый клиент';

    validatorText([name.querySelector('input'), surname.querySelector('input'), lastName.querySelector('input')]);

    const form = createForm([title, surname, name, lastName, addContact, save, cancel]);

    modalContent.append(form);

    processingForm(form);

    openModal();
  });

  function processingForm(form) {
    const cancel = form.querySelector('.cancel');
    const addContact = form.querySelector('.addContact');
    const save = form.querySelector('.save');
    const remove = form.querySelector('.remove');
    const resave = form.querySelector('.resave');

    if(cancel) {
      cancel.addEventListener('click', () => {
        closeModal(form.closest('.modal__content'));
      });
    }

    if(addContact) {
      addContact.addEventListener('click', () => {
        const contactInput = getFieldContact();
        const div = document.createElement('div');

        div.classList.add('modal__new-contact');

        dropdown([contactInput[0].querySelector('.dropdown')]);
        clearInput([contactInput[1].querySelector('.modal__new-contact__wrapp')]);

        div.append(...contactInput);

        addContact.before(div);
      });
    }

    if(resave) {
      resave.addEventListener('click', (event) => {
        const form = event.currentTarget.closest('form');
        const contacts = [];

        const req = checkEmptyInput(event.currentTarget.closest('form').querySelectorAll('.req-input'));

        if(!req) return;

        const client = {
          name: form.name.value.trim(),
          surname: form.surname.value.trim(),
          lastName: form.lastname.value.trim(),
        };

        if(form.querySelector('.modal__new-contact')) {
          form.querySelectorAll('.modal__new-contact').forEach((contact) => {
            if(contact.querySelector('.modal__new-contact__input').value.trim() !== '') {
              contacts.push({type: contact.querySelector('.dropdown__select').textContent, value: contact.querySelector('.modal__new-contact__input').value});
            }
          });
        }

        client.contacts = contacts;

        fetchApi.setRewrite(form.dataset.client, client).then(() => {
          closeModal(modal.querySelector('.modal__content'));

          clearTable();

          allTable();
        });
      });
    }

    if(remove) {
      remove.addEventListener('click', () => {
        fetchApi.removeClient(form.dataset.client).then(() => {
          closeModal(modal.querySelector('.modal__content'));

          clearTable();

          allTable();
        });
      });
    }

    if(save) {
      save.addEventListener('click', (event) => {
        const form = event.currentTarget.closest('form');
        const contacts = [];

        const req = checkEmptyInput(event.currentTarget.closest('form').querySelectorAll('.req-input'));

        if(!req) return;

        const client = {
          name: form.name.value.trim(),
          surname: form.surname.value.trim(),
          lastName: form.lastname.value.trim(),
        };

        if(form.querySelector('.modal__new-contact')) {
          form.querySelectorAll('.modal__new-contact').forEach((contact) => {
            if(contact.querySelector('.modal__new-contact__input').value.trim() !== '') {
              contacts.push({type: contact.querySelector('.dropdown__select').textContent, value: contact.querySelector('.modal__new-contact__input').value});
            }
          });
        }

        client.contacts = contacts;

        fetchApi.setClients(client).then(() => {
          closeModal(modal.querySelector('.modal__content'));

          clearTable();

          allTable();
        });
      });
    }
  }

  function clearTable() {
    loaderTable.style.display = 'block';

    document.querySelectorAll('div[data-status="info"]').forEach((div) => {
      div.remove();
    });
  }

  function validatorText(inputs) {
    inputs.forEach((input) => {
      input.addEventListener('input', function(event) {
        event.currentTarget.value = event.currentTarget.value.replace(/[,.?!~@#/\d]/g,'');
      })  
    });
  }

  function checkEmptyInput(inputs) {
    let status = true;
    
    inputs.forEach((input) => {
      input.querySelector('input').classList.remove('req-input_empty');
      if(input.querySelector('input').value.trim() === '') {
        status = false;

        input.querySelector('input').classList.add('req-input_empty');
      }
    });

    return status;
  }

  function clearInput(inputs) {
    inputs.forEach((input) => {
      input.querySelector('.modal__new-contact__svg').addEventListener('click', () => {
        input.closest('.modal__new-contact').remove();
      });
    });
  }

  function dropdown(dropdowns = document.querySelectorAll('.dropdown')) {
    dropdowns.forEach((dropdown) => {
      const def = dropdown.querySelector('.dropdown__element_select');
      const select = dropdown.querySelector('.dropdown__select');

      if(def) select.textContent = def.textContent;

      select.addEventListener('click', (event) => {
        document.querySelectorAll('.dropdown').forEach((dropdown) => {
          if(dropdown !== event.currentTarget.closest('.dropdown')) dropdown.classList.remove('dropdown_show');
        });

        dropdown.classList.toggle('dropdown_show');

        dropdown.querySelectorAll('.dropdown__element').forEach((element) => {
          element.addEventListener('click', (event) => {
            event.currentTarget.closest('.dropdown').classList.remove('dropdown_show');
            event.currentTarget.closest('.dropdown__list').querySelector('.dropdown__element_select').classList.remove('dropdown__element_select');
            event.currentTarget.classList.add('dropdown__element_select');

            select.textContent = event.currentTarget.textContent;
          });
        });
      });
    });
  }

  function getFieldContact() {
    const newContact = newContactTemp.content.cloneNode(true)
    const newContactInput = newContactInputTemp.content.cloneNode(true)
    
    return [newContact, newContactInput];
  }

  function createForm(field) {
    const form = document.createElement('form');

    form.classList.add('modal__form');

    form.append(...field);

    return form;
  }

  function viewClients(clients) {
    clients.forEach((item) => {
      const client = getClientHtml(item);

      setClientHtml(client)
    });
  }

  function setClientHtml(client) {
    const table = document.querySelector('.people__table');

    for(let key in client) {
      table.append(client[key])
    }
  }

  function getClientHtml(client) {
    const clientObj = {
      id: document.createElement('div'),
      name: document.createElement('div'),
      create: document.createElement('div'),
      update: document.createElement('div'),
      contacts: document.createElement('div'),
      button: document.createElement('div'),
    };
    const dateCreate = new Date(client.createdAt);
    const dateUpdate = new Date(client.updatedAt);
    const contacts = getContactHtml(client.contacts);

    for(let clientKey in clientObj) {
      clientObj[clientKey].classList.add('people__table-line');
      clientObj[clientKey].dataset.status = "info";
      clientObj[clientKey].dataset.client = client.id;
    }

    clientObj.id.textContent = client.id;
    clientObj.name.textContent = `${client.surname} ${client.name} ${client.lastName}`;

    const spanDataCreate = document.createElement('span');
    const spanTimeCreate = document.createElement('span');
    const spanDataUpdate = document.createElement('span');
    const spanTimeUpdate = document.createElement('span');

    spanDataCreate.classList.add('people__table-data');
    spanTimeCreate.classList.add('people__table-time');
    spanDataUpdate.classList.add('people__table-data');
    spanTimeUpdate.classList.add('people__table-time');
    clientObj.id.classList.add('people__table-id');
    clientObj.button.classList.add('people__table-edit-wrapp');
    
    spanDataCreate.textContent = `${dateCreate.getDate()}.${dateCreate.getMonth() + 1}.${dateCreate.getFullYear()}`;
    spanTimeCreate.textContent = `${dateCreate.getHours()}:${dateCreate.getMinutes()}`;
    spanDataUpdate.textContent = `${dateUpdate.getDate()}.${dateUpdate.getMonth() + 1}.${dateUpdate.getFullYear()}`;
    spanTimeUpdate.textContent = `${dateUpdate.getHours()}:${dateUpdate.getMinutes()}`;

    clientObj.create.append(spanDataCreate, spanTimeCreate);
    clientObj.update.append(spanDataUpdate, spanTimeUpdate);

    contacts.forEach((contact) => {
      clientObj.contacts.append(contact);
    });

    const edit = document.createElement('button');
    const remove = document.createElement('button');

    edit.classList.add('people__table-button', 'people__table-edit');
    remove.classList.add('people__table-button', 'people__table-remove');

    edit.textContent = 'Изменить';
    remove.textContent = 'Удалить';

    edit.addEventListener('click', (event) => {
      fetchApi.getClient(event.currentTarget.closest('div[data-status="info"]').dataset.client)
        .then((response) => {
          const surname = surnameTemp.content.cloneNode(true);
          const name = nameTemp.content.cloneNode(true);
          const lastName = lastNameTemp.content.cloneNode(true);
          const title = titleTemp.content.cloneNode(true);
          const cancel = cancelTemp.content.cloneNode(true);
          const addContact = addContactTemp.content.cloneNode(true);
          const save = saveTemp.content.cloneNode(true);
    
          title.querySelector('h2').textContent = 'Изменить данные';
    
          validatorText([name.querySelector('input'), surname.querySelector('input'), lastName.querySelector('input')]);

          surname.querySelector('input').value = response.surname;
          name.querySelector('input').value = response.name;
          lastName.querySelector('input').value = response.lastName;

          save.querySelector('.save').classList.add('resave');
          save.querySelector('.save').classList.remove('save');

          const form = createForm([title, surname, name, lastName, addContact, save, cancel]);

          form.dataset.client = response.id;

          modalContent.append(form);

          if(response.contacts.length > 0) {
            response.contacts.forEach((contact) => {
              const contactInput = getFieldContact();
              const div = document.createElement('div');

              div.classList.add('modal__new-contact');

              contactInput[1].querySelector('input').value = contact.value;
              contactInput[0].querySelectorAll('.dropdown__element').forEach((typeContact) => {
                typeContact.classList.remove('dropdown__element_select');
                if(typeContact.textContent === contact.type) {
                  typeContact.classList.add('dropdown__element_select');
                }
              });

              dropdown([contactInput[0].querySelector('.dropdown')]);
              clearInput([contactInput[1].querySelector('.modal__new-contact__wrapp')]);

              div.append(...contactInput);
              form.querySelector('.addContact').before(div);
            });
          }
    
          processingForm(form);
    
          openModal();
        });
    });

    remove.addEventListener('click', (event) => {
      const title = titleTemp.content.cloneNode(true);
      const cancel = cancelTemp.content.cloneNode(true);
      const remove = removeTemp.content.cloneNode(true);
      const message = document.createElement('p');

      message.classList.add('modal__message');

      message.textContent = 'Вы действительно хотите удалить данного клиента?';
      title.querySelector('h2').textContent = 'Удалить клиента';

      const form = createForm([title, message, remove, cancel]);

      form.dataset.client = event.currentTarget.closest('div[data-status="info"]').dataset.client;

      modalContent.append(form);

      processingForm(form);

      openModal();
    })

    clientObj.button.append(edit);
    clientObj.button.append(remove);

    return clientObj;
  }

  function getContactHtml(contacts) {
    let contactsArray = [];

    contacts.forEach((contact, index) => {
      contactsArray.push(document.createElement('div'));

      const marker = document.createElement('div');
      const popup = document.createElement('div');

      contactsArray[index].classList.add('tooltip', contact.type === 'Телефон' ? 'tel' : contact.type === 'Другое' ? 'other' : contact.type);
      marker.classList.add('tooltip__marker');
      popup.classList.add('tooltip__popup');

      marker.tabIndex = 0;

      popup.textContent = contact.value;

      contactsArray[index].append(marker, popup);
    });
    
    return contactsArray;
  }

  function openModal() {
    modal.classList.add('modal_active');

    const close = modal.querySelector('.modal__close');
    const wrapper = modal.querySelector('.modal__wrap');
    
    modal.addEventListener('click', (event) => {
      const withinBoundaries = event.composedPath().includes(wrapper);

      if(!withinBoundaries) closeModal(modal.querySelector('.modal__content'));
    });

    close.addEventListener('click', () => {
      closeModal(modal.querySelector('.modal__content'));
    });
  }

  function closeModal(content) {
    modal.classList.remove('modal_active');

    content.innerHTML = '';
  }
});