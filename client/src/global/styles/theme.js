// styles/theme.js
import { horizontalScale, moderateScale,  verticalScale } from '../../theme/Metrics.js';
export const fonts = {
    regular: 'RFDewi-Regular', // Match the font file name without the `.ttf` extension
    bold: 'RFDewi-Bold',
    number: 'RFDewiExtended-Regular',
    extendedBold: "RFDewiExtended-Bold"
  };
  
  export const globalStyles = {
    container: {
      flex: 1,
      padding: 20,
      
      
    },
    textRegular: {
      fontFamily: fonts.regular,
      fontSize: moderateScale(16),
      fontWeight:"500",
    },
    textBold: {
      fontFamily: fonts.bold,
      fontSize: moderateScale(25),
      fontWeight: "700"
    },
  };
  