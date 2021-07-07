import { IFail } from "../interfaces/IFail";
import User from "../models/User";
import Course from "../models/Course";
import TodayChallengeResponseDTO, { TodayChallengeDetailResponseDTO } from "../dto/Challenge/TodayChallenge/TodayChallengeResponseDTO";

export default {
  today: async (token: String, courseId: String, challengeId: String) => {
    try {
      const user = await User.findOne({ id: token });
      const courses = await Course.find();
      let dummyCourse = await Course.findOne({ id: courseId });
      const progressCourseId = Number(courseId);
      const progressChallengeId = Number(challengeId);

      // user jwt 토큰으로 유저 식별
      if (!user) {
        const notExistUser: IFail = {
          status: 404,
          message: "유저가 존재하지 않습니다.",
        };
        return notExistUser
      }
    
      // 해당 코스가 존재하지 않을 때
      if (!dummyCourse) {
        const notExistCourse: IFail = {
          status: 404,
          message: "해당 id의 코스가 존재하지 않습니다",
        };
        return notExistCourse;
      } 
      
      // 진행 중인 코스가 없을 경우 오류
      user.courses.forEach((course) => {
        if (course.situation != 1) {
          if (course.id === progressCourseId) {
            const notProgressCourse: IFail = {
              status: 400,
              message: "현재 진행 중인 코스가 아닙니다.",
            }
            return notProgressCourse;
          }
        }
      });
      
      const userCourse = user.courses[progressCourseId - 1];
      // 해당 challenge id가 진행 중이 아닐 경우
      if (userCourse.challenges[progressChallengeId - 1].situation != 1) {
        const notProgressChallenge: IFail = {
          status: 400,
          message: "현재 진행 중인 챌린지가 아닙니다.",
        };
        return notProgressChallenge;
      }

      // dummy data
      dummyCourse = courses[progressCourseId - 1];
      const dummyChallenge = courses[progressCourseId - 1].challenges;
      
      // response할 challenge 배열 만들어서 저장
      let challengeArray: Array<TodayChallengeDetailResponseDTO> = new Array<TodayChallengeDetailResponseDTO>();
      userCourse.challenges.forEach((challenge) => {
        let ments: Array<String> = new Array<String>();
        dummyChallenge[challenge.id - 1].userMents.forEach((ment) => {
          ments.push(ment.ment);
        });

        const responseChallenge: TodayChallengeDetailResponseDTO = {
          id: challenge.id,
          situation: challenge.situation,
          title: dummyChallenge[challenge.id - 1].title,
          description: dummyChallenge[challenge.id - 1].description,
          year: challenge.year,
          month: challenge.month,
          day: challenge.day,
          currentStamp: challenge.currentStamp,
          totalStamp: dummyChallenge[challenge.id - 1].totalStamp,
          userMents: ments
        };
        challengeArray.push(responseChallenge);
      });

      // 최종 responseDTO
      const responseDTO: TodayChallengeResponseDTO = {
        status: 200,
        data: {
          course: {
            id: userCourse.id,
            situation: userCourse.situation,
            title: dummyCourse.title,
            description: dummyCourse.description,
            totalDays: dummyCourse.totalDays,
            property: dummyCourse.property,
            challenges: challengeArray,
          },
        },
      };

      return responseDTO;
    } catch (err) {
      console.error(err.message);
    }
  }
}