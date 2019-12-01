import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Button, Text, ScrollView, Image } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import { add, minus, asyncAdd } from '../../actions/counter'
import { apiHost } from '@api/request'

import './index.styl'


// #region 书写注意
//
// 目前 typescript 版本还无法在装饰器模式下将 Props 注入到 Taro.Component 中的 props 属性
// 需要显示声明 connect 的参数类型并通过 interface 的方式指定 Taro.Component 子类的 props
// 这样才能完成类型检查和 IDE 的自动提示
// 使用函数模式则无此限制
// ref: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20796
//
// #endregion

type PageStateProps = {
  counter: {
    num: number
  }
}

type PageDispatchProps = {
  add: () => void
  dec: () => void
  asyncAdd: () => any
}

type PageOwnProps = {}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Index {
  props: IProps;
}

@connect(({ counter }) => ({
  counter
}), (dispatch) => ({
  add () {
    dispatch(add())
  },
  dec () {
    dispatch(minus())
  },
  asyncAdd () {
    dispatch(asyncAdd())
  }
}))
class Index extends Component {

    /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '好好快餐'
  }

  state = {
    listData: [],
    activeIndex: 0,
    toView: 'a0',
    scrollTop: 100,
    screenWidth: 667,
    showModalStatus: false,
    currentType: 0, //当前分类
    currentIndex: 0,//当前分类下序号
    sizeIndex: 0,//杯型分类序号
    sugarIndex: 0,//甜度分类序号
    temIndex: 0,//温度分类序号
    sugar: ['正常糖', '少糖', '半糖'],
    tem: ['正常冰', '少冰', '去冰'],
    size: ['常规', '珍珠', '西米露'],
    cartList: [],//购物车
    sumMonney: 0,//总金额
    cupNumber: 0,//总杯数
    scrollH: 1000,
    showCart: false,//是否显示购物车
    loading: false,
    cartMap: {},//购物车map
    model: 0,//1是预约模式  0是到店模式
    appointTime: "",
    scrollArr: [],
    sizeBox: [],
    sizeEx: 0
  }

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount () { }

  componentDidMount () {
    // console.log(options.model)
    // console.log(options.appointTime)
    // if (options.model == 1) {
    //   this.setState({
    //     model: 1,
    //     appointTime: options.appointTime
    //   })
    // }
    // var that = this;
    // this.getList()
  }

  getList() {
    var that = this;
    var sysinfo = Taro.getSystemInfoSync().windowHeight;
    console.log(sysinfo)
    Taro.showLoading()
    let offsetS = 120
    //兼容iphoe5滚动
    if (sysinfo < 550) {
      offsetS = -40
    }
    //兼容iphoe Plus滚动
    if (sysinfo > 650 && sysinfo < 700) {
      offsetS = 240
    }
    Taro.request({
      url: apiHost + '/getfoodList',
      method: 'GET',
      data: {},
      header: {
        'Accept': 'application/json'
      },
      success: function (res) {
        let scrollArr = [0]
        //动态计算联动节点
        for (let i = 0; i < res.data.data.length; i++) {
          console.log(res.data.data[i].foods.length)
          scrollArr.push(scrollArr[i] + 73 * res.data.data[i].foods.length + 18)
        }
        that.setState({
          scrollArr: scrollArr,
          listData: res.data.data,
          loading: true,
          scrollH: sysinfo * 2 - offsetS
        })
        Taro.hideLoading();
      }
    })
  }

  selectMenu = (e) => {
    var index = e.currentTarget.dataset.index
    console.log(index)
    this.setState({
      activeIndex: index,
      toView: 'a' + index,
    })
  }
  //监听滚动 完成右到左的联动
  scroll = (e) => {
    var dis = e.detail.scrollTop
    const { scrollArr } = this.state
    for (let i = 0; i < scrollArr.length; i++) {
      if (i < scrollArr.length - 1) {
        if (dis > scrollArr[i] && dis < scrollArr[i + 1]) {
          console.log(i)
          this.setState({
            activeIndex: i,
          })
          break;
        }
      } else {
        this.setState({
          activeIndex: scrollArr.length - 1,
        })
      }

    }
  }
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  selectInfo = (e) => {
    var type = e.currentTarget.dataset.type;
    var index = e.currentTarget.dataset.index;
    var a = this.state;
    var tem = a.listData[type].foods[index].tem;
    var temBox = [];
    for (let i = 0; i < tem.length; i++) {
      temBox.push(tem[i].specs)
    }
    this.setState({
      showModalStatus: !this.state.showModalStatus,
      currentType: type,
      currentIndex: index,
      sizeBox: ["常规"],
      sizeEx: 0,
      sugarIndex: 0,
      temIndex: 0,
      tem: temBox
    });
  }
  closeModal () {
    this.setState({
      showModalStatus: false
    });
  }
  chooseSE = (e) => {
    var a = this.state.listData;
    var index = e.currentTarget.dataset.index;
    var type = e.currentTarget.dataset.type;
    if (type == 0) {
      var item = a[this.state.currentType].foods[this.state.currentIndex].size
      var sizeBox = this.state.sizeBox;
      var sizeEx = this.state.sizeEx;
      if (item[index].packing_fee == 0) {
        item[index].packing_fee = 1
        sizeBox.push(item[index].specs)
        sizeEx += item[index].price
      } else {
        item[index].packing_fee = 0
        for (let i = 0; i < sizeBox.length; i++) {
          if (sizeBox[i] == item[index].specs) {
            sizeBox.splice(i, 1)
            sizeEx -= item[index].price
          }
        }

      }
      this.setState({
        listData: a,
        sizeBox: sizeBox,
        sizeEx: sizeEx
      });
    }
    if (type == 1) {
      this.setState({
        sugarIndex: index
      });
    }
    if (type == 2) {
      this.setState({
        temIndex: index
      });
    }
  }
  //查看是否添加过相同规格的商品
  isSameAdd () {
    var a = this.state
    var name = a.listData[a.currentType].foods[a.currentIndex].name
    var detail = a.size[a.sizeIndex] + "+" + a.sugar[a.sugarIndex] + "+" + a.tem[a.temIndex]
    var cartList = this.state.cartList;
    for (var i = 0; i < cartList.length; i++) {
      if ((name == cartList[i].name) && (detail == cartList[i].detail)) {
        return i
      }
    }
  }
  //加入购物车
  addToCart () {
    var a = this.state
    var listData = a.listData;
    var cartList = this.state.cartList;
    if (this.isSameAdd() != undefined) {
      console.log("添加过")
      cartList[this.isSameAdd()].number += 1
    } else {
      console.log("没加过")
      var detail = "";
      for (let i = 0; i < a.sizeBox.length; i++) {
        detail += a.sizeBox[i] + ","
      }
      var addItem = {
        "cType": a.currentType,
        "cIndex": a.currentIndex,
        "name": a.listData[a.currentType].foods[a.currentIndex].name,
        "price": a.listData[a.currentType].foods[a.currentIndex].price + a.sizeEx,
        "enName": a.listData[a.currentType].foods[a.currentIndex].enName,
        "detail": detail + "+" + a.sugar[a.sugarIndex] + "+" + a.tem[a.temIndex],
        "number": 1,
        "sum": a.listData[a.currentType].foods[a.currentIndex].price + a.sizeEx,
        "img": a.currentType + 1 + "-" + a.listData[a.currentType].foods[a.currentIndex].img,
        "desc": a.listData[a.currentType].foods[a.currentIndex].desc
      }
      cartList.push(addItem);
    }


    //刷新总金额
    var sumMonney = a.sumMonney + a.listData[a.currentType].foods[a.currentIndex].price + a.sizeEx;
    //刷新单品杯数
    listData[a.currentType].foods[a.currentIndex].num += 1
    this.setState({
      cartList: cartList,
      showModalStatus: false,
      sumMonney: sumMonney,
      cupNumber: a.cupNumber + 1,
      listData: listData
    });
    console.log(this.state.cartList)
  }
  showCartList () {
    console.log(this.state.showCart)
    if (this.state.cartList.length != 0) {
      this.setState({
        showCart: !this.state.showCart,
      });
    }

  }
  clearCartList () {
    this.setState({
      cartList: [],
      showCart: false,
      sumMonney: 0
    });
  }
  addNumber (e) {
    var index = e.currentTarget.dataset.index;
    console.log(index)
    var cartList = this.state.cartList;
    var listData = this.state.listData
    console.log(listData[cartList[index].cType].foods[cartList[index].cIndex].num)
    listData[cartList[index].cType].foods[cartList[index].cIndex].num = listData[cartList[index].cType].foods[cartList[index].cIndex].num + 1
    cartList[index].number++;
    var sum = this.state.sumMonney + cartList[index].price;
    cartList[index].sum += cartList[index].price;
    this.setState({
      listData: listData,
      cartList: cartList,
      sumMonney: sum,
      cupNumber: this.state.cupNumber + 1
    });
  }
  decNumber (e) {
    var index = e.currentTarget.dataset.index;
    console.log(index)
    var cartList = this.state.cartList;
    var listData = this.state.listData
    listData[cartList[index].cType].foods[cartList[index].cIndex].num = listData[cartList[index].cType].foods[cartList[index].cIndex].num - 1
    var sum = this.state.sumMonney - cartList[index].price;
    cartList[index].sum -= cartList[index].price;
    cartList[index].number == 1 ? cartList.splice(index, 1) : cartList[index].number--;
    this.setState({
      listData: listData,
      cartList: cartList,
      sumMonney: sum,
      showCart: cartList.length == 0 ? false : true,
      cupNumber: this.state.cupNumber - 1
    });
  }
  goBalance () {
    if (this.state.sumMonney != 0) {
      Taro.setStorageSync('cartList', this.state.cartList);
      Taro.setStorageSync('sumMonney', this.state.sumMonney);
      Taro.setStorageSync('cupNumber', this.state.cupNumber);
      Taro.navigateTo({
        url: '../order/balance/balance?model=' + this.state.model + "&appointTime=" + this.state.appointTime
      })
    }
  }
  //提示
  notice () {
    var that = this;
    Taro.showModal({
      title: '提示',
      content: '因含有规格，请在购物车内删减',
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          that.setState({
            showCart: true
          });
        }
      }
    })
  }

  componentDidShow () { }

  componentDidHide () { }

  render () {
    const { listData, activeIndex } = this.state
    return (
      <View className='index'>
        {/* 左侧菜单 */}
        <View className="list-left-menu">
          {
            listData.map((item, index) => {
              return (
                <View key="unique" className={`${index === activeIndex ? 'list-left-menu-box-selected' : 'list-left-menu-box-unselect'}`} data-index="{{index}}" onClick={this.selectMenu}>
                  <View className="list-menu-name">{ item.name }</View>
                </View>
              )
            })
          }
        </View>

        {/* 右侧菜单 */}
        <ScrollView scrollY={true} style='height:{{scrollH}}rpx;' onScroll={this.scroll} scrollIntoView={this.state.toView} scrollTop={this.state.scrollTop}>
          {
            listData.map((item, index) => {
              return (
                <View className="content" id={`a${index}`} key="unique">
                  <View className='list-tab'>{ item.name }</View>
                  {
                    item.foods.map((items, indexs) => {
                      return (
                        <View className='content-list' key="unique">
                          <View className='list-image-box'>
                            <Image className="list-image" mode="widthFix" src='{{"http://cdn.handsomebird.xin/t"+items.type+"-"+items.img+".jpg?imageView2/2/w/144/h/144/format/png/q/75|watermark/2/text/5aWI6Iy25rC05bOw/font/5a6L5L2T/fontsize/240/fill/I0ZGRkZGRg==/dissolve/100/gravity/NorthEast/dx/5/dy/5|imageslim"}}' lazy-load></Image>
                          </View>
                          <View className='issue-name'>
                            <View>{ items.name }</View>
                            <View style='margin-top:20rpx;color:#F05A86'>
                              ¥ { items.price }.00

                              <Text className="iconfont icon-jiahao2fill plus-icon fr" data-type="index" data-index="indexs" onClick={this.selectInfo}></Text>
                              {
                                items.num > 0 &&
                                <Text className="fr pl">{ items.num }</Text>
                              }
                              {
                                items.num > 0 &&
                                <Text className="iconfont icon-jian icon-li-circle fr"  onClick={this.notice}></Text>
                              }
                            </View>
                          </View>
                        </View>
                      )
                    })
                  }
                </View>
              )
            })
          }
        </ScrollView>
        {/* 底部操作菜单 */}
        {
          this.state.loading &&
          <View className="operate-bar">
            <View className='gouwuche'>
              <View style='padding:5px;display:flex'>
                <Text className="iconfont icon-gouwuchefill gouwuche-icon {{sumMonney!=0?'activity-color':'' }}" onClick={this.showCartList}>
                  {
                    this.state.cartList.length !== 0 &&
                    <Text className="number-msg">{ this.state.cupNumber }</Text>
                  }
                </Text>
                {
                  this.state.sumMonney === 0 ?
                  <View className='gouwuche-price'>购物车是空的</View> :
                  <View className='gouwuche-price' style='color:white;font-size:18px'>¥ { this.state.sumMonney }.00</View>
                }
              </View>
            </View>
            <View className="submit-btn {{sumMonney!=0?'activity-color-bg':'' }}" onClick={this.goBalance}>
              <View className="submit-btn-label {{sumMonney!=0?'color-white':'' }}">选好了</View>
            </View>
          </View>
        }
        {/* 选择弹窗 */}
        {
          this.state.showModalStatus &&
          <View className="drawer_screen" onClick={this.closeModal} data-statu="close"></View>
        }
        {
          this.state.showModalStatus &&
          <View className="drawer_box_ad">
          <View className="drawer_content_ad">
            <View style='font-size:16px;display:flex;justify-content:center;'> { this.state.listData[this.state.currentType].foods[this.state.currentIndex].name } </View>
            <View className="select-line-nav">加料</View>
            <View style='display:flex'>
              {
                this.state.listData[this.state.currentType].foods[this.state.currentIndex].size.map(item => <View className={`select-tab ${item.packing_fee==1?'select-active':''}`} key="unique" data-type='0' data-index='index' onClick={this.chooseSE}>{ item.specs }</View>)
              }
            </View>
            <View className="select-line-nav">糖度</View>
            <View className='display:flex'>
              {
                this.state.sugar.map((item, index) => <View className={`select-tab ${index== this.state.sugarIndex?'select-active':''}`} key="unique" onClick={this.chooseSE} data-type='1' data-index={index}>{{item}}</View>)
              }
            </View>
            <View  className="select-line-nav">温度</View>
            <View style='display:flex'>
              {
                this.state.tem.map((item, index) => <View className={`select-tab ${index === this.state.temIndex ? 'select-active' : ''}`} key="unique" onClick={this.chooseSE} data-type='2' data-index={index}>{ item }</View>)
              }
            </View>
            <View className="select-price">¥{ this.state.listData[this.state.currentType].foods[this.state.currentIndex].price + this.state.sizeEx }.00
              <Button className="btn-putIn" onClick={this.addToCart}>加入购物车</Button>
            </View>
          </View>
        </View>
        }
        {/* 购物车 */}
        {
          this.state.showCart &&
          <View className="drawer_screen" onClick={this.showCartList} data-statu="close"></View>
        }
        {
          this.state.showCart &&
          <View className="cartlist-float">
            <View style='background:#F0F0F0;height:30px'>
              <Text className='label-cart-bar'>
                <Text style='padding:5px'>已选商品</Text>
              </Text>
              <Text className='icon-clear' onClick={this.clearCartList}>
                <Text className="iconfont icon-lajitong"></Text>
                <Text className="label-clear">清空购物车</Text>
              </Text>
            </View>
            <ScrollView scrollY={true} className={`${this.state.cartList.length>5?'cart-scroll-list':''}`}>
              {
                this.state.cartList.map((item, index) => {
                  return (
                    <View className='cart-list-box' key="unique" style='border-bottom:1px #E3E3E3 solid'>
                      <View className='list-info'>
                        <View>{ item.name }</View>
                        <View className='list-info-size'>{ item.detail }</View>
                      </View>
                      <View style='width:50%;padding:10px;'>
                        <View style='float:right'>
                          <Text className='activity-color font16'>¥ {item.sum}.00</Text>
                          <Text className="iconfont icon-jian icon-li-circle" data-index={index} onClick={this.decNumber}></Text>
                          <Text className="pl font16">{item.number}</Text>
                          <Text className="iconfont icon-jiahao2fill activity-color font20" data-index={index} onClick={this.addNumber}></Text>
                        </View>
                      </View>
                    </View>
                  )
                })
              }
            </ScrollView>
          </View>
        }
      </View>
    )
  }
}

// #region 导出注意
//
// 经过上面的声明后需要将导出的 Taro.Component 子类修改为子类本身的 props 属性
// 这样在使用这个子类时 Ts 才不会提示缺少 JSX 类型参数错误
//
// #endregion

export default Index as ComponentClass<PageOwnProps, PageState>
