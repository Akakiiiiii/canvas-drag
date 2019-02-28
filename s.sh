mkdir $1
cd $1
mkdir css js
echo '<!DOCTYPE>' >> index.html
echo '<title>Hello</title>'  >> index.html
echo '<h1>Hi</h1>' >> index.html
echo 'h1{color: red;}' >> css/style.css
echo ' var string = "Hello World"' >> js/main.js
echo 'alert(string)' >> js/main.js
exit