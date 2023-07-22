

    // the link to your model provided by Teachable Machine export panel
    const URL_Man = "./my_model_male/";
    const URL_Woman = "./my_model_female/";
    let URL = URL_Man;
    let gender = "Male";
    let model, webcam, guageContainer, maxPredictions, prediction;
    let gaugeData = {};

    var sideMenu = document.getElementById("side-menu");
    var menuButton = document.getElementById("menu-button");
    var backButton = document.getElementById("back-button");
    var sideMenuSelectors = $('.selector');
    var pages = $('.page');

    // 사이드 메뉴 selector 에 Event 구현
    for (let i = 0; i < sideMenuSelectors.length; i++) {
        console.log(sideMenuSelectors, pages);
        sideMenuSelectors[i].addEventListener("click", function () {
            sideMenu.style.height = "0px";
            backButton.style.display = "block";
            loadPage(this.id);
        });
    }



    async function handleFileUpload(event) {
        try {
            const file = event.target.files[0];
            const fileReader = new FileReader();
            const image = document.getElementById('previewImg');
            fileReader.readAsDataURL(file);

            fileReader.onload = function () {
                document.getElementById('upload-area').style.display = 'none';
                image.src = fileReader.result;

                image.onload = function () {
                    image.style.display = 'block';
                }
            }

            // 로딩 페이지 표시
            document.getElementById('loading-page').style.display = 'flex';

            await init();
            Predict();
            adjustDisplay();

        } catch (error) {
            console.error(error);
        }
    }

    async function init() {
        console.log("Init..");

        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        console.log("Init End");
    }

    async function Predict() {
        console.log("predicting...");

        var image = document.getElementById("previewImg");
        var gaugeFill = document.getElementsByClassName("gauge_fill");
        prediction = await model.predict(image, false);
        createDataList();
        fillGauge();
        fillAnimalExplanation();
        console.log("predict End");
    }


    function fillGauge() {
        fillRandomColors();

        const pointCounters = $(".point_counter");
        const textContainers = $(".text_container");
        console.log(gaugeData[1][1]);
        pointCounters.each(function (i, obj) {
            animateValue(obj, 0, gaugeData[i][1], 100);
        });

        textContainers.each(function (i, obj) {
            obj.textContent = gaugeData[i][0];
        });
    }

    function fillAnimalExplanation() {
        var mainEx = document.getElementById("main-explain");
        var subEx = document.getElementById("sub-explain");

        fetch('animalDiscriptions.json')
            .then(response => response.json())
            .then(descriptions => {
                let userGender = gender == "Male" ? "남자" : "여자";
                let userAnimal = gaugeData[0][0].replace(/상/g, "");;
                let description = descriptions["설명"][userGender][userAnimal];
                let summary = descriptions["요약"][userGender][userAnimal];
                let randomColor = getRandomColor();
                subEx.textContent = description;
                mainEx.textContent = summary;
                mainEx.style.color = randomColor;
            });
    }

    function fillRandomColors() {
        const progressBar = $(".progress_bar");
        const colors = [
            { start: "rgba(240, 128, 128, 0.5)", end: "rgba(240, 128, 128, 1)" }, // Light Coral
            { start: "rgba(135, 206, 235, 0.5)", end: "rgba(135, 206, 235, 1)" }, // Sky Blue
            { start: "rgba(144, 238, 144, 0.5)", end: "rgba(144, 238, 144, 1)" }, // Light Green
            { start: "rgba(255, 182, 193, 0.5)", end: "rgba(255, 182, 193, 1)" }, // Light Pink
            { start: "rgba(221, 160, 221, 0.5)", end: "rgba(221, 160, 221, 1)" }, // Plum
            { start: "rgba(255, 215, 0, 0.5)", end: "rgba(255, 215, 0, 1)" }, // Gold
            { start: "rgba(64, 224, 208, 0.5)", end: "rgba(64, 224, 208, 1)" } // Turquoise
        ];

        // Shuffle the colors array
        for (let i = colors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [colors[i], colors[j]] = [colors[j], colors[i]];
        }

        progressBar.each(function (i) {
            console.log(this);
            $(this).css(
                "background",
                `linear-gradient(to bottom, ${colors[i].start}, ${colors[i].end})`
            );
            $(this).css("width", `${gaugeData[i][1]}%`);
        });
    }

    function getRandomColor() {
        const colors = [
            "#17A2B8", // 청록색
            "#28A745", // 녹색
            "#6F42C1", // 보라색
            "#007BFF", // 파랑색
            "#FD7E14", // 오렌지색
            "#DC3545" // 빨강색
        ];
        const randomIndex = Math.floor(Math.random() * colors.length);
        return colors[randomIndex];
    }
    function handleGenderChange(event) {
        let genderToggle = document.getElementById("gender-toggle");
        gender = event.target.checked ? "Female" : "Male";
        genderToggle.style.backgroundColor = (gender == "Male") ? '#8999e1' : '#f998d8';
        URL = (gender == 'Male') ? URL_Man : URL_Woman;
    }
    function CheckExceptionTarget(elem) {
        const tryAgainButton = document.getElementById('tryAgain-button');
        let array = [tryAgainButton];

        return array.includes(elem);
    }

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.textContent = Math.floor(progress * (end - start) + start) + "%";
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    function createDataList() {
        console.log("createData");
        for (let i = 0; i < maxPredictions; i++) {
            const key = prediction[i].className;
            const value = prediction[i].probability.toFixed(2) * 100;
            gaugeData[key] = value;
        }

        // predict 결과값의 크기에 따라 내림차순으로 정렬
        const sortedEntries = Object.entries(gaugeData).sort((a, b) => b[1] - a[1]);
        gaugeData = sortedEntries.slice(0, 3);
    }
    function adjustDisplay() {
        // 게이지 생성
        document.getElementById('gauge-container').style.display = 'block';
        // 로딩 페이지 숨기기
        document.getElementById('loading-page').style.display = 'none';
        // 타이틀 숨기기
        document.querySelector('#mainPage .title').style.display = 'none';
        // 젠더 토글 숨기기
        document.getElementById('gender-toggle').style.display = 'none';
        // tryAgainButton 생성
        document.getElementById('tryAgain-button').style.display = 'block';

        // 동물상 설명 생성
        document.getElementById("main-explain").style.display = 'block';
        document.getElementById("sub-explain").style.display = 'block';
    }

    // MenuButton Event
    document.getElementById("menu-button").addEventListener("click", function (event) {
        event.stopPropagation();
        var pageContainer = document.getElementById("page-container");
        let style = window.getComputedStyle(sideMenu);
        let transitionDuration = style.getPropertyValue("transition-duration");
        let transitionDurationSeconds = parseFloat(transitionDuration);
        let sideMenuHeight = style.getPropertyValue("height");


        if (sideMenu.style.height === "0px") {
            console.log("sideMenu is opening");
            sideMenu.style.height = "100px";
            menuButton.style.zIndex = "-1";
            backButton.style.zIndex = "-1";
            // pageContainer.style.transform = "translateY(" + sideMenuHeight + ")";
        } else {
            console.log("sideMenu is closing");
            sideMenu.style.height = "0px";
            menuButton.style.zIndex = "2"; 
            backButton.style.zIndex = "2";
            // pageContainer.style.transform = "translateY(0px)";
        }

        backButton.style.display = "none";
    });
    // SideBar Event
    document.addEventListener('click', function (event) {

        var isClickSideMenu = sideMenu.contains(event.target);
        var isClickMenuButton = menuButton.contains(event.target);

        // 클릭한 요소가 side-menu와 menu-button 외부에 있는지 확인합니다.
        if (!isClickSideMenu && !isClickMenuButton) {
            console.log("it's outside of menu");
            let style = window.getComputedStyle(sideMenu);
            let transitionDuration = style.getPropertyValue("transition-duration");
            let transitionDurationSeconds = parseFloat(transitionDuration);

            // side-menu가 이미 열려있는지 확인합니다.
            if (sideMenu.style.height !== "0px") {
                console.log("it's outside of menu and side-menu is closing");
                // side-menu를 닫으므로 menu-button을 다시 보이게 합니다.
                sideMenu.style.height = "0px"; // side-menu의 높이를 0으로 설정해 숨깁니다.
                // page-container의 위치를 원래대로 복구합니다.
                document.getElementById("page-container").style.transform = "translateY(0px)";

                // transition-duration 후에 side-menu를 완전히 숨깁니다.
                setTimeout(function () {
                    menuButton.style.zIndex = "2";
                    sideMenu.style.height = "0px";
                }, transitionDurationSeconds * 1000); // 밀리초로 변환
            }
        }


    });

    // BackButton Event
    document.getElementById("back-button").addEventListener("click", function (event) {
        event.stopPropagation();

        var pageContainer = document.getElementById("page-container");
        let style = window.getComputedStyle(sideMenu);
        let transitionDuration = style.getPropertyValue("transition-duration");
        let transitionDurationSeconds = parseFloat(transitionDuration);
        let sideMenuHeight = style.getPropertyValue("height");


        if (sideMenu.style.height === "0px") {
            console.log("sideMenu is opening");
            sideMenu.style.height = "100px";
            menuButton.style.zIndex = "-1";
            backButton.style.zIndex = "-1";
            // pageContainer.style.transform = "translateY(" + sideMenuHeight + ")";
        } else {
            console.log("sideMenu is closing");
            sideMenu.style.height = "0px";
            menuButton.style.zIndex = "2"; 
            backButton.style.zIndex = "2";
            // pageContainer.style.transform = "translateY(0px)";
        }
    });
    // 다시하기 버튼 이벤트
    document.getElementById('tryAgain-button').addEventListener('click', function () {
        location.reload();
    });

    function getCurrentPage() {
        pages.each(function (i) {
            console.log(`pages' Index : ${i}`);
            console.log(pages[i].style.display);
            if (pages[i].style.display === 'block') {
                console.log("do it");
                return 'page-' + (i + 1);
            }
        });
        return null;
    }

    function loadPage(pageId) {
        var mainPage = document.getElementById("mainPage");
        // Loop through all pages
        console.log(`pages Length : ${pages.length}`)
        for (var i = 0; i < pages.length; i++) {
            if (pageId === 'menu-' + (i + 1)) {
                pages[i].style.display = 'block';
                mainPage.style.display = 'none';
                console.log("block");
            } else {
                pages[i].style.display = 'none';
                mainPage.style.display = 'none';
                console.log("none");
            }
        }
    }

