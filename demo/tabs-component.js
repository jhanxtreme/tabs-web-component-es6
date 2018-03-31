;(function(document){
    'use strict';
    customElements.define('tab-component', class extends HTMLElement{
        constructor(){
            super();
            this.root = this.attachShadow({ mode: 'open' });
            this.template = `
                <style>
                :host{
                    postition: relative;
                }
                .tab-component{
                    display: none;
                }
                .tab-component.active{
                    display: block;
                }
                .slideIn{
                    animation-name: slideIn;
                    animation-duration: .35s;
                    animation-fill-mode: both;
                }
                @keyframes slideIn{
                    0%{
                        opacity: 0;
                        transform: translateY(-10%)
                    }
                    100%{
                        opacity: 1;
                        transform: translateX(0%)
                    }
                }
                </style>
                <div class="tab-component slideIn">
                    <slot></slot>
                </div>
            `;
        }

        static get observedAttributes() {
            return ['active'];
        }

        updateTab(){
            this.root.innerHTML = this.template;
            if(this.attributes['active']){
                this.root.querySelector('.tab-component').classList.add('active');
            }else if(this.root.querySelector('.tab-component').className.indexOf('active') > -1){
                this.root.querySelector('.tab-component').classList.remove('active');
            }
        }
        
        connectedCallback() {
            if(this.parentElement.nodeName !== 'TABS-COMPONENT'){
                console.error('No parent tabs');
                return;
            }
            this.updateTab();
        }

        attributeChangedCallback(name, oldVal, newVal){
            this.updateTab();
        }
    });
    
    customElements.define('tabs-component', class extends HTMLElement {
        constructor(){
            super();
            this.root = this.attachShadow({ mode: 'open' });
            this.template = `
                <style>
                :host{
                    position: relative;
                    font-family: arial;
                    font-size: 100%;
                }
                *, *::after, *::before{
                    box-sizing: border-box;
                }
                .tabs-component {
                    min-height: 300px;
                }
                .tab-buttons{
                    border-bottom: 1px #ddd solid;
                }
                .tab-buttons .btn{
                    display: inline-block;
                    padding: 1em;
                    cursor: pointer;
                    text-align:center;
                    white-space: nowrap;
                }
                .tab-buttons .btn.active{
                    border-bottom:3px #ff5722 solid;
                    background-color:#f9f9f9;
                }
                </style>
                <div class="tabs-component">
                    <div class="tab-buttons"></div>
                    <slot></slot>
                </div>
            `;
        }

        connectedCallback() {
            this.root.innerHTML = this.template;

            let tabsButtonsElement =  this.root.querySelector('.tab-buttons');
            let tabComponentsElements = this.querySelectorAll('tab-component');

            if(tabComponentsElements.length === 0){
                console.error('No tab items.');
                return;
            }

            let currentContent = null; //default
            let previousContent = null;
            let currentBtn = null;
            let previousBtn = null;

            let hasDefault = null;

            //check if has default active tab
            tabComponentsElements.forEach(elem=>{
                if(elem.attributes.active && elem.attributes.active.value && elem.attributes.active.value === 'true'){
                    hasDefault = elem;
                }
            });

            //if hast no default, set the index 0 as default
            if(!hasDefault){
                currentContent = tabComponentsElements[0];
                currentContent.setAttribute('active', 'true');
            }

            //iterate the tab items
            for(let i=0, n=tabComponentsElements.length; i<n; i++){
                let elem = tabComponentsElements[i];

                let button = document.createElement('div');
                button.className = 'btn';
                button.innerHTML = elem.attributes.title ? elem.attributes.title.value : 'No Header Text';

                //set active on view by adding active class
                if(elem && elem.attributes.active && elem.attributes.active.value === 'true'){
                    currentContent = elem;
                    currentBtn = button;
                    currentBtn.className += ' active';
                }

                //add click events to the buttons
                button.onclick = (buttonEvent)=>{
                    //content
                    previousContent = currentContent;
                    currentContent = elem;
                    if(previousContent){
                        previousContent.removeAttribute('active');
                    }
                    currentContent.setAttribute('active', 'true');

                    //button
                    previousBtn = currentBtn;
                    currentBtn = buttonEvent.target;
                    if(previousBtn){
                        previousBtn.classList.remove('active');
                    }
                    currentBtn.classList.add('active');
                };
                tabsButtonsElement.appendChild(button);
            }

            if(this.attributes['buttons-width'] && this.attributes['buttons-width'].value === 'full'){
                if(this.root.querySelectorAll('.tab-buttons .btn')){
                    let width = (100 / this.root.querySelectorAll('.tab-buttons .btn').length).toFixed(2);
                    this.root.querySelectorAll('.tab-buttons .btn').forEach(btn=>{
                        btn.setAttribute('style', 'width: ' + width + '%;');
                    });
                }
            }

        }

        static get observedAttributes(){
            return ['buttons-width'];
        }

        attributeChangedCallback(name, oldVal, newVal) {
            // console.log('attributeChangedCallback', name, oldVal, newVal);
        }
    });

})(document);