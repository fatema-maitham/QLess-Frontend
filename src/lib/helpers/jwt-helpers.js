export function getUserFromToken() {
  const token = getToken();
  const user = window.localStorage.getItem('user');
  if (!token || !user) return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function parseToken(token){
   // if there is no token, then the user is not signed in
    if(!token) return null

    // then extract the payload (second part of the token)
    const payload = token.split('.')[1]

    // Convert the serialized payload into JSON
    const tokenJSON = atob(payload)

    // Take that json and convert it back into JS
    return JSON.parse(tokenJSON)
}

export function removeToken(){
    window.localStorage.removeItem('token')
}

export function registerToken(token){
    window.localStorage.setItem('token', token);
}