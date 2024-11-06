// styles/theme.js
import { horizontalScale, moderateScale,  verticalScale } from '../../theme/Metrics.js';
export const fonts = {
    regular: 'Roboto-Regular', // Match the font file name without the `.ttf` extension
    bold: 'Montserrat-ExtraBold',
  };
  
  export const globalStyles = {
    container: {
      flex: 1,
      padding: 16,
    },
    textRegular: {
      fontFamily: fonts.regular,
      fontSize: moderateScale(16),
      fontWeight:"500",
    },
    textBold: {
      fontFamily: fonts.bold,
      fontSize: moderateScale(24),
      fontWeight: "700"
    },
  };
  