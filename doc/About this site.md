# About the development of this site

## container的几个临界值

  `@media (min-width: 992px)`

  `@media (min-width: 768px)`

  `@media (min-width: 576px)`

## 关于背景图片颜色
  `//import images:`
  
  `background-image: url("../images/bgi-dark.jpg");`

  `//theme color:`
  
  `color: #97ff77;`

  `//preloader background color:`

  `color: #2B333B;`
  
  `//the light yellow from Blizzard`
  
  `color: #eeffcc;`

## z-index记录
* aw-header 整个标题栏 1003
* aw-header-content 标题栏中的所有内容 1005
* 菜单 1007
* body 900
* 所有的边框 1000
* 按钮1002
* preloader 2000

## 关于特殊字体：
* Alien web font (主要用在大写的字体，好看): font-family: Inconsolata;
* rectangular font (没啥用，长方形，难看): font-family: 'Orbitron', sans-serif;

## html文件注意
  `"&amp;" : "&"`
  
  `"&lt;" : "<"`
  
  `"&gt;" : ">"`