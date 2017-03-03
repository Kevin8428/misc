function apiFunction(email, password, type) {
  return new Promise((resolve, reject) => {
    let result;
    if (type == "registration") {
      result = registration(email)
      resolve(result)
    } else if (type == "login") {
      result = login(email, password)
      resolve(result)
    } else {
      reject("failed")
    }
  });
}

function registration(email) {
  return new Promise((resolve, reject) => {
      const xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
      xhr.open('GET', '/email/verify/'+email);
      xhr.onload = function () {
        resolve(this.responseText)
      }
      xhr.onerror = function () {
        reject({
          status: this.status,
          statusText: xhr.statusText
        })
      }
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded', 'Access-Control-Allow-Origin');
      xhr.send(null);
  });
}

function login(email, password) {
  return new Promise((resolve, reject) => {
      let encodedCredentials = "email=" + encodeURIComponent(email) + "&password=" + encodeURIComponent(password)
      const xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
      xhr.open('POST', '/user/user-bcrypt');
      xhr.onload = function () {
        if (this.responseText == "password is valid") {
          resolve(true)
        } else if (this.responseText == "password is not valid") {
          resolve(false)
        } else {
          resolve(this.responseText)
        }
      }
      xhr.onerror = function () {
        reject({
          status: this.status,
          statusText: xhr.statusText
        })
      }
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded', 'Access-Control-Allow-Origin');
      xhr.send(encodedCredentials)
  });
}

export default { apiFunction: apiFunction }
