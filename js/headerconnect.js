class MyHeader extends HTMLElement{
    connectedCallback(){
        this.innerHTML = `<header>
        <style>
*{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
.navbar{
    display: flex;
    align-items: center;
    padding: 20;
    height: 50px;
}
.items {
    background-color: #161880;
    padding: 20px 25px;
}
.items a {
    color: white; 
}
.items ul {
    list-style-type: none;
}
.items ul li {
    display: inline-block;
    margin-right: 20px;
}
nav{
    flex: 1;
    text-align: center;
}
nav ul{
    display: inline-block;
    list-style-type: none;
}
nav ul li{
    display: inline-block;
    margin-right: 20px;
}
a{
    text-decoration: none;
    color: #262626;
    margin-right: 7px;
}
.conatiner{
    max-width: 1300px;
    margin: auto;
    padding-left: 25px;
    padding-right: 25px;
}
        </style>
     <div class="container">
        <div class="navbar"> 
            <div class="logo">
                <img src="" width="100">
            </div> 
            <nav>
                <ul>
                    <li>
                        <a href="../index.html">&#127968; Home</a>
                        <a href="">&#128176; Deals</a>
                        <a href="">&#128722; Shop</a>
                        <a href="">&#127873;Today's offer </a>
                    </li>
                </ul>
            </nav>
          </div>
          <div class="items">
            <nav>
                <ul>
                    <li>
                        <a href="Electronics.html" target="_blank">&#128241; Electronics</a>
                            <a href="Fashion.html" target="_blank">&#128087; Fashion</a>
                            <a href="Grocery.html" target="_blank">&#128722; Grocery</a>
                            <a href="HF.html" target="_blank">&#128716;Home & Furniture </a>
                            <a href="TKS.html" target="_blank">&#127879;Toys & Kid Accessories</a>
                    </li>
                </ul>
            </nav>
        </div>
    </div>
      `
        ;
    }
}
customElements.define("my-header",MyHeader);