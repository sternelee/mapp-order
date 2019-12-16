/* tslint:disable */
/* eslint-disable */

import Taro, { FunctionComponent } from '@tarojs/taro';
import Icon from './h5/H5Icon';

interface Props {
  name: 'plus' | 'mifan' | 'shizhong' | 'dingcan' | 'ziyuan' | 'diancan' | 'shizhong1' | 'chufangyongpin' | 'mifan1' | 'jiahao' | 'weixinzhifu1' | 'dingcan1' | 'touxiang' | 'diancanma' | 'fan' | 'tubiaozhizuomoban' | 'meishi';
  size?: number;
  color?: string | string[];
}

const IconFont: FunctionComponent<Props> = (props) => {
  const { name, size, color } = props;

  return <Icon name={name} size={parseFloat(Taro.pxTransform(size))} color={color} />;
};

IconFont.defaultProps = {
  size: 18,
};

export default IconFont;
