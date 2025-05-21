// Bejelentkezés
function Login(){
    const loginRequest = new XMLHttpRequest()
    loginRequest.open('post','/auth/login')
    loginRequest.setRequestHeader('Content-Type','Application/json')

    loginRequest.send(JSON.stringify({
        'loginUsername':userLabel.value,
        'loginPassword':passwordLabel.value
    }))

    loginRequest.onreadystatechange = () => {
        if(loginRequest.readyState == 4){
            const result = JSON.parse(loginRequest.response)
            console.log(result.message)
            alert(result.message)
            if(loginRequest.status == 201){
                sessionStorage.setItem('token',result.token)
                console.log('Siker')
            document.getElementById('AfterLogin').classList.remove('hidden');
            document.getElementById('profileSection').classList.remove('hidden');
              document.getElementById('LoginRegisterCard').classList.add('hidden');
            }
        }
    }
}

// Profil megtekintése
function Profil() {
    const profileRequest = new XMLHttpRequest();
    profileRequest.open('GET', '/users/me');
    const token = sessionStorage.getItem('token');
    profileRequest.setRequestHeader('Authorization', 'Bearer ' + token);

    profileRequest.onreadystatechange = () => {
        if (profileRequest.readyState === 4) {
            if (profileRequest.status === 200) {
                const result = JSON.parse(profileRequest.responseText);
                document.getElementById('mename').innerText = result.username;
                document.getElementById('mepassword').innerText = result.password;
            }
        }
    };

    profileRequest.send();
}

// Regisztráció
function Register(){
    const registerRequest = new XMLHttpRequest()
    registerRequest.open('post','/users/register')
    registerRequest.setRequestHeader('Content-Type','Application/JSON')
    registerRequest.send(JSON.stringify({
        'registerUsername':userLabel.value,
        'registerPassword':passwordLabel.value
    }))
    registerRequest.onreadystatechange = () => {
        if(registerRequest.readyState == 4){
            const result = JSON.parse(registerRequest.response)
            console.log(result.message)
            alert(result.message)
        }
    }
}



// Új utazás létrehozása
function createTrip() {
    const token = sessionStorage.getItem('token');
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/trips');
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.setRequestHeader('Content-Type', 'application/json');

    const data = {
        name: tripTitle.value,
        destination: tripLocation.value,
        accommodation: tripAccommodation.value,
        transport: tripTransport.value,
        description: tripDesc.value,
        date: tripDate.value
    };

    xhr.send(JSON.stringify(data));

    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            const res = JSON.parse(xhr.responseText);
            alert(res.message);
            console.log(res);
        }
    };
}

// Utazások listázása
function listTrips() {
    const token = sessionStorage.getItem('token');
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/trips');
	
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);

    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) 
		{
            const trips = JSON.parse(xhr.responseText);
            const list = document.getElementById('tripList');
            list.innerHTML = '';
            trips.forEach(trip => {
                const li = document.createElement('li');
                li.innerText = `${trip.id}. ${trip.name} (${trip.date})`;
                list.appendChild(li);
            });
        }
    };

    xhr.send();
}

// Utazás részletes megtekintése
function getTrip() {
    const token = sessionStorage.getItem('token');
    const id = tripId.value;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/trips/${id}`);
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);


    xhr.onreadystatechange = () => 
	{
        if (xhr.readyState === 4) {
            const detailBox = document.getElementById('tripDetail');
            if (xhr.status === 200) {
                const trip = JSON.parse(xhr.responseText);
                detailBox.innerText = JSON.stringify(trip, null, 2);
            } else {
                detailBox.innerText = 'Nem található utazás.';
            }
			
        }
    };

    xhr.send();
}





// Utazás módosítása
function updateId(id){
    const searchIdRequest = new XMLHttpRequest()
    searchIdRequest.open('put', '/trips/'+id)
    searchIdRequest.setRequestHeader('Content-Type','Application/JSON')
    searchIdRequest.send(JSON.stringify({
        'tripName':updateNameLabel.value,
        'tripDestination':updateDestinationLabel.value,
        'tripAccommodation':updateAccommodationLabel.value,
        'tripTransport':updateTransportLabel.value,
        'tripDescription':updateDestinationLabel.value,
        'tripDate':updateDateLabel.value

        
    }))
    searchIdRequest.onreadystatechange = () => {
        if(searchIdRequest.readyState == 4){
            const result = JSON.parse(searchIdRequest.response)
            console.log(result.message)
            alert(result.message)
        }
    }
}

// Utazás keresése név alapján
function searchName(name){
    const searchNameRequest = new XMLHttpRequest()
    searchNameRequest.open('get', '/trips/name/'+name)
    searchNameRequest.setRequestHeader('Content-Type','Application/JSON')
    searchNameRequest.send()
    searchNameRequest.onreadystatechange = () => {
        if(searchNameRequest.readyState == 4){
            if(searchNameRequest.status == 200){
                const result = JSON.parse(searchNameRequest.response)
                const container = document.getElementById("searchResultContainer")
                container.textContent = JSON.stringify(result)
                console.log(result)
            }
            else{
                const result = JSON.parse(searchNameRequest.response)
                console.log(result.message)
                alert(result.message)
            }
        }
    }
}



// Utazás törlése
function deleteTrip(id){
    const deleteTripRequest = new XMLHttpRequest()
    deleteTripRequest.open('delete', '/trips/'+id)
    deleteTripRequest.setRequestHeader('Content-Type','Application/JSON')
    deleteTripRequest.send()
    deleteTripRequest.onreadystatechange = () => {
        if(deleteTripRequest.readyState == 4){
            const result = JSON.parse(deleteTripRequest.response)
            console.log(result.message)
            alert(result.message)
        }
    }
}
