import SmallSatisfaction from "../models/SmallSatisfaction"
import User from "../models/User";
import { SmallSatisfactionWriteRequestDTO } from "../dto/SmallSatisfaction/Write/request/SmallSatisfactionWriteDTO"
import { SmallSatisfactionWriteResponseDTO } from "../dto/SmallSatisfaction/Write/response/SmallSatisfactionWriteDTO"
import SmallSatisfactionMyDrawerResponseDTO, { myDrawerResponseDTO } from "../dto/SmallSatisfaction/MyDrawer/response/SmallSatisfactionMyDrawerResponseDTO";
import SmallSatisfactionCommunityResponseDTO, { CommunityResponseDTO } from "../dto/SmallSatisfaction/Community/response/SmallSatisfactionCommunityResponseDTO";
import SmallSatisfactionDetailResponseDTO from "../dto/SmallSatisfaction/Detail/response/SmallSatisfactionDetailResponseDTO";
import { IFail } from "../interfaces/IFail";

export default {
  write: async (token: String, dto: SmallSatisfactionWriteRequestDTO) => {
    let today = new Date();
    let todayYear = today.getFullYear().toString();
    let todayMonth = (today.getMonth() + 1).toString();
    let todayDay = today.getDate().toString();
    let smallSatisfactionCount = await SmallSatisfaction.countDocuments();

    const user = await User.findOne({ id: token });

    if (!user) {
      const notExistUser: IFail = {
        status: 400,
        message: "유저가 존재하지 않습니다.",
      };
      return notExistUser
    }
    
    try{
      const {       
        content,
        moodText,
        moodImage,
        mainImage,
        hashtags,
        isPrivate, } = dto;
          
      let smallSatisfaction = new SmallSatisfaction({
        user: user._id,
        content,
        moodText,
        moodImage,
        mainImage,
        hashtags,
        isPrivate, 
        year: todayYear,
        month: todayMonth,
        day: todayDay,
        postId: smallSatisfactionCount,
        likeCount: 0,
      });
      
      await smallSatisfaction.save();

      const responseDTO: SmallSatisfactionWriteResponseDTO = {
        status: 200,
        data: {
          image : mainImage,
        }
      };

      return responseDTO;
    }
    catch (err) {
      console.error(err.message);
    }
  },
  
  myDrawer: async (token: String, year: string, month: string) => {
    const user = await User.findOne({ id: token });
    if (!user) {
      const notExistUser: IFail = {
        status: 400,
        message: "유저가 존재하지 않습니다.",
      };
      return notExistUser;
    }

    //SmallSatisfactionMyDrawerResponseDTO, myDrawerResponseDTO

    let myDrawerSmallSatisfactions = await SmallSatisfaction.find({ user: user._id, year: year, month: month }, {}, {}).sort({ date: -1 });
    try{
      let myDrawers: Array<myDrawerResponseDTO> =  new Array<myDrawerResponseDTO>();
      myDrawerSmallSatisfactions.forEach((myDrawerSmallSatisfaction) => {
        let liked;
        if (myDrawerSmallSatisfaction.likes.filter((like) => like.user.toString() === token)
            .length > 0
      ) {
        liked = true;
      }
      else {
        liked = false;
      }


      const responseDTO: myDrawerResponseDTO = {
        postId: myDrawerSmallSatisfaction.postId,
        nickname: user.nickname,
        moodImage: myDrawerSmallSatisfaction.moodImage,
        mainImage: myDrawerSmallSatisfaction.mainImage,
        likeCount: myDrawerSmallSatisfaction.likes.length,
        content: myDrawerSmallSatisfaction.content,
        hasLike: liked,
        hashtags: myDrawerSmallSatisfaction.hashtags,
        year: myDrawerSmallSatisfaction.year,
        month: myDrawerSmallSatisfaction.month,
        day: myDrawerSmallSatisfaction.day,
        date: myDrawerSmallSatisfaction.date,
      }
      myDrawers.push(responseDTO);
    });

    const responseDTO: SmallSatisfactionMyDrawerResponseDTO = {
      status: 200,
      data: {
        myDrawerSmallSatisfactions: myDrawers
      }
    };
    return responseDTO;
  } catch (err) {
    console.error(err);
  }
},
  
  community: async (token: String, sort: String) => {
    const user = await User.findOne({ id: token });
    if (!user) {
      const notExistUser: IFail = {
        status: 400,
        message: "유저가 존재하지 않습니다.",
      };
      return notExistUser;
    }
    
    let smallSatisfactionWritten;
    let today = new Date();
    let todayYear = today.getFullYear().toString();
    let todayMonth = (today.getMonth() + 1).toString();
    let todayDay = today.getDate().toString();

    let hasSmallSatisfaction = await SmallSatisfaction.findOne({ year: todayYear, month: todayMonth, day: todayDay, user: user._id });
    user.courses.forEach((course) => {
      course.challenges.forEach((challenge) => {
        if ((challenge.situation === 2) && (!hasSmallSatisfaction)) {
          smallSatisfactionWritten = false;                               
        }
        else {
          smallSatisfactionWritten = true;
        }
      });
    });
      
    const userCount = await SmallSatisfaction.findOne({ year: todayYear, month: todayMonth, day: todayDay }).countDocuments();

    let communitySmallSatisfactions;
    if (sort === "date") {
      communitySmallSatisfactions = await SmallSatisfaction.find({ isPrivate: false }).sort({ date: -1 });
    }

    if (sort === "like") {
      communitySmallSatisfactions = await SmallSatisfaction.find({ isPrivate: false }).sort({ likeCount: -1 });
    }

    try{  
      let responseSmallSatisfaction: Array<CommunityResponseDTO> = new Array<CommunityResponseDTO>();
      communitySmallSatisfactions.forEach((communitySmallSatisfaction) => {
        
        let userNickname = "투명견";

        let liked;
        if (communitySmallSatisfaction.likes.filter((like) => like.user.toString() === token)
            .length > 0
        ) {
          liked = true;
        }
        else {
          liked = false;
        }

        const responseDTO: CommunityResponseDTO = {
          postId: communitySmallSatisfaction.postId,
          nickname: userNickname,
          moodImage: communitySmallSatisfaction.moodImage,
          mainImage: communitySmallSatisfaction.mainImage,
          likeCount: communitySmallSatisfaction.likes.length,
          content: communitySmallSatisfaction.content,
          hasLike: liked,
          hashtags: communitySmallSatisfaction.hashtags,
          year: todayYear,
          month: todayMonth,
          day: todayDay,
          date: communitySmallSatisfaction.date,
        }
        responseSmallSatisfaction.push(responseDTO);
      });
    
      const responseDTO: SmallSatisfactionCommunityResponseDTO = {
        status: 200,
        data: {
          hasSmallSatisfaction: smallSatisfactionWritten,
          userCount: userCount,
          smallSatisfactions: responseSmallSatisfaction,
        }
      };
      return responseDTO;
    } catch (err) {
      console.error(err.message);
    }
  },
  detail: async (token: String, postId: string) => {
    let postNumber = parseInt(postId);
    const user = await User.findOne({ id: token });
    if (!user) {
      const notExistUser: IFail = {
        status: 400,
        message: "유저가 존재하지 않습니다.",
      };
      return notExistUser;
    }

    try {
      let detailSmallSatisfaction = await SmallSatisfaction.findOne({ postId: postNumber });
      if (!detailSmallSatisfaction) {
          const notExistSatisfaction: IFail = {
            status: 400,
            message: "소확행이 존재하지 않습니다.",
          };
          return notExistSatisfaction;
      }


      let liked;
      if (detailSmallSatisfaction.likes.filter((like) => like.user.toString() === token)
          .length > 0
      ) {
        liked = true;
      }
      else {
        liked = false;
      }
  
      let smallSatisfactionUser = await User.findOne({ _id: detailSmallSatisfaction.user });
      let userNickname = smallSatisfactionUser.nickname;
    
      const responseDTO: SmallSatisfactionDetailResponseDTO = {
        status: 200,
        data: {
          postId: detailSmallSatisfaction.postId,
          nickname: userNickname,
          moodImage: detailSmallSatisfaction.moodImage,
          mainImage: detailSmallSatisfaction.mainImage,
          likeCount: detailSmallSatisfaction.likes.length,
          content: detailSmallSatisfaction.content,
          hasLike: liked,
          hashtags: detailSmallSatisfaction.hashtags,
          year: detailSmallSatisfaction.year,
          month: detailSmallSatisfaction.month,
          day: detailSmallSatisfaction.day,
          date: detailSmallSatisfaction.date
        }
      }
  
      return responseDTO; 
    } catch (err) {
    console.error(err.message);
    }
  }
}