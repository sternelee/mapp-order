import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Button, Text, Image, Swiper, SwiperItem, ScrollView, PickerView, PickerViewColumn } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import './new.styl'

type PageStateProps = {
  counter: {
    num: number
  },
  user: User,
  page: {
    openTime: number,
    closeTime: number
  }
}

type PageDispatchProps = {
  add: () => void
  dec: () => void
  asyncAdd: () => any,
  userSet: (val: object) => any,
  pageSet: (val: object) => any
}

type PageOwnProps = {}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Index {
  props: IProps;
}

@connect(({ page }) => ({
  page
}), (dispatch) => ({
  
}))
class Index extends Component {
  config: Config = {
    navigationBarTitleText: '首页'
  }
  state = {

  }
  componentDidShow () {

  }
  render () {
    return (
      <View className="new">

      </View>
    )
  }
 }

 export default Index as ComponentClass<PageOwnProps, PageState>