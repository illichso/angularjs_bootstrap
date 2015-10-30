install nodejs server
npm install -g http-server

then cd into dir containing your index.html and issue :
http-server -c-1


which spins up a nodejs httpd which does a dir listing of your static files visible from :
http://localhost:8080