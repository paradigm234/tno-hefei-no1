import { GameState, GameEvent } from '../types';

export const FLAVOR_EVENTS: Record<string, GameEvent> = {
  support_bill_event: {
    id: 'support_bill_event',
    title: '表态：支持议案',
    description: '你决定在议会中公开表态支持当前的议案。这需要消耗一定的政治点数来进行游说和动员，但能显著增加该议案的通过几率。',
    choices: [
      {
        text: '全力支持！ (消耗 10 PP，赞同率 +15)',
        previewText: '消耗 10 PP，赞同率 +15',
        effect: (state: GameState) => {
          if (state.stats.pp < 10 || !state.parliamentState?.activeBill) return state;
          return {
            ...state,
            stats: { ...state.stats, pp: state.stats.pp - 10 },
            parliamentState: {
              ...state.parliamentState,
              activeBill: {
                ...state.parliamentState.activeBill,
                lobbiedApproval: state.parliamentState.activeBill.lobbiedApproval + 15,
                interactedFactions: [...state.parliamentState.activeBill.interactedFactions, 'support_bill']
              }
            }
          };
        }
      },
      {
        text: '再考虑一下',
        previewText: '取消操作',
        effect: (state: GameState) => state
      }
    ]
  },
  oppose_bill_event: {
    id: 'oppose_bill_event',
    title: '表态：反对议案',
    description: '你决定在议会中公开表态反对当前的议案。这需要消耗一定的政治点数来组织反对力量，能显著降低该议案的通过几率。',
    choices: [
      {
        text: '坚决反对！ (消耗 10 PP，赞同率 -15)',
        previewText: '消耗 10 PP，赞同率 -15',
        effect: (state: GameState) => {
          if (state.stats.pp < 10 || !state.parliamentState?.activeBill) return state;
          return {
            ...state,
            stats: { ...state.stats, pp: state.stats.pp - 10 },
            parliamentState: {
              ...state.parliamentState,
              activeBill: {
                ...state.parliamentState.activeBill,
                lobbiedApproval: state.parliamentState.activeBill.lobbiedApproval - 15,
                interactedFactions: [...state.parliamentState.activeBill.interactedFactions, 'oppose_bill']
              }
            }
          };
        }
      },
      {
        text: '再考虑一下',
        previewText: '取消操作',
        effect: (state: GameState) => state
      }
    ]
  },
  negotiate_orthodox: {
    id: 'negotiate_orthodox',
    title: '与钢铁红蛤正统派交涉',
    description: '王兆凯推开办公室的门时，带进来一股凛冽的寒意。他左臂上的红袖章在昏暗的灯光下显得格外刺眼。这位钢铁红蛤的领袖没有多余的寒暄，直接将一份被红笔涂改得面目全非的法案草案拍在了潘仁越的桌上。\n\n“潘主席，你的小布尔乔亚天真简直令人发笑。”王兆凯的声音冷酷得像一台精准运作的机器，“在没有掌握绝对的做题资源之前，搞什么‘素质拓展’无异于向资产阶级投降。红蛤可以按下赞成键，但条件是：删除草案里关于削减思政教育的所有条款，并且，下周高三年级部配发的市模考绝密卷，必须优先保障我们先锋队的供应。”\n\n他俯下身，死死盯着潘仁越的眼睛：“革命不是请客吃饭，选票也不是免费的馈赠。要么交出试卷，要么你的法案今天就会死在议会里。”',
    choices: [
      {
        text: '同意他的条件',
        previewText: '+15 赞同票，权力平衡向“应试教育”偏移 10，TPR -500，钢铁红蛤支持度上升',
        effect: (state: GameState) => {
          if (state.parliamentState?.activeBill) {
            return {
              parliamentState: {
                ...state.parliamentState,
                activeBill: {
                  ...state.parliamentState.activeBill,
                  lobbiedApproval: state.parliamentState.activeBill.lobbiedApproval + 15
                },
                powerBalance: Math.min(100, state.parliamentState.powerBalance + 10)
              },
              stats: { ...state.stats, tpr: Math.max(0, state.stats.tpr - 500) },
              studentAssemblyFactions: state.studentAssemblyFactions ? {
                ...state.studentAssemblyFactions,
                orthodox: state.studentAssemblyFactions.orthodox + 2,
                pan: Math.max(0, state.studentAssemblyFactions.pan - 2)
              } : undefined
            };
          }
          return {};
        }
      },
      {
        text: '拒绝妥协',
        previewText: '赞同票不变，王兆凯愤怒离去，钢铁红蛤支持度下降，稳定度 -5',
        effect: (state: GameState) => {
          return {
            stats: { ...state.stats, stab: Math.max(0, state.stats.stab - 5) },
            studentAssemblyFactions: state.studentAssemblyFactions ? {
              ...state.studentAssemblyFactions,
              orthodox: Math.max(0, state.studentAssemblyFactions.orthodox - 2),
              pan: state.studentAssemblyFactions.pan + 2
            } : undefined
          };
        }
      }
    ]
  },
  negotiate_bear: {
    id: 'negotiate_bear',
    title: '与钢铁红蛤狗熊派交涉',
    description: '狗熊是哼着轻快的不知名小调滑进办公室的。作为钢铁红蛤的创始成员，他如今却成了一个彻头彻尾的投机主义和抽象乐子人。他随手把一个沾着油渍的U盘扔到潘仁越的公文堆上。\n\n“潘哥，别这么愁眉苦脸的嘛。”狗熊嚼着口香糖，满不在乎地说，“我知道你差几票。我们的人可以全投给你，只要你帮个小忙——明天中午的校园广播，把那首老掉牙的《运动员进行曲》掐了，换成这首二次元OP，单曲循环三遍。”\n\n潘仁越感到一阵荒谬的眩晕。百年名校的民主进程，无数人流血流汗换来的议会表决，现在竟然要靠一首宅舞神曲来决定生死？这就是他梦寐以求的自由吗？',
    choices: [
      {
        text: '播放二次元歌曲',
        previewText: '+10 赞同票，学生理智度 -5，正统派支持度下降',
        effect: (state: GameState) => {
          if (state.parliamentState?.activeBill) {
            return {
              parliamentState: {
                ...state.parliamentState,
                activeBill: {
                  ...state.parliamentState.activeBill,
                  lobbiedApproval: state.parliamentState.activeBill.lobbiedApproval + 10
                }
              },
              stats: { ...state.stats, studentSanity: Math.max(0, state.stats.studentSanity - 5) },
              studentAssemblyFactions: state.studentAssemblyFactions ? {
                ...state.studentAssemblyFactions,
                bear: state.studentAssemblyFactions.bear + 2,
                orthodox: Math.max(0, state.studentAssemblyFactions.orthodox - 2)
              } : undefined
            };
          }
          return {};
        }
      },
      {
        text: '拒绝这种荒唐的要求',
        previewText: '赞同票不变，狗熊派感到无趣',
        effect: (state: GameState) => state
      }
    ]
  },
  negotiate_pan: {
    id: 'negotiate_pan',
    title: '与潘仁越民主派交涉',
    description: '潘仁越的追随者们希望你能在法案中加入更多保障学生基本权利的条款。',
    choices: [
      {
        text: '承诺保障学生权利',
        previewText: '+15 赞同票，权力平衡向“素质教育”偏移 10，联盟团结度 +5',
        effect: (state: GameState) => {
          if (state.parliamentState?.activeBill) {
            return {
              parliamentState: {
                ...state.parliamentState,
                activeBill: {
                  ...state.parliamentState.activeBill,
                  lobbiedApproval: state.parliamentState.activeBill.lobbiedApproval + 15
                },
                powerBalance: Math.max(0, state.parliamentState.powerBalance - 10)
              },
              stats: { ...state.stats, allianceUnity: Math.min(100, state.stats.allianceUnity + 5) }
            };
          }
          return {};
        }
      },
      {
        text: '目前法案已经足够了',
        previewText: '赞同票不变，民主派感到失望，联盟团结度 -5',
        effect: (state: GameState) => {
          return {
            stats: { ...state.stats, allianceUnity: Math.max(0, state.stats.allianceUnity - 5) }
          };
        }
      }
    ]
  },
  negotiate_otherDem: {
    id: 'negotiate_otherDem',
    title: '与非建制民主派交涉',
    description: '下午三点，办公室外排起了长队。他们不是来讨论教育理念的，而是非建制派的各个小团体代表。\n\n“潘主席，B1楼二层的女厕所门锁坏了两个月了，只要你承诺明天修好，我们寝室的八票就是你的。”\n\n“潘主席，如果法案能特赦上周因为带手机被抓的同学，我们社团就投赞成票。”\n\n潘仁越揉着发胀的太阳穴，被迫在这场名为“民主”的集市上讨价还价。没有人在乎《校园自治法案》的长远意义，他们只在乎眼前这几平米的蝇头小利。每一次点头，都要消耗他本就不多的政治资源；每一次签字，都让这份神圣的法案变得像一份打满补丁的破布。',
    choices: [
      {
        text: '满足他们的诉求',
        previewText: '+10 赞同票，PP -40',
        disabled: (state: GameState) => state.stats.pp < 40,
        effect: (state: GameState) => {
          if (state.parliamentState?.activeBill) {
            return {
              stats: { ...state.stats, pp: state.stats.pp - 40 },
              parliamentState: {
                ...state.parliamentState,
                activeBill: {
                  ...state.parliamentState.activeBill,
                  lobbiedApproval: state.parliamentState.activeBill.lobbiedApproval + 10
                }
              }
            };
          }
          return { stats: { ...state.stats, pp: state.stats.pp - 20 } };
        }
      },
      {
        text: '无视他们',
        previewText: '赞同票不变',
        effect: (state: GameState) => state
      }
    ]
  },
  negotiate_testTaker: {
    id: 'negotiate_testTaker',
    title: '与做题派交涉',
    description: '王卷豪站在办公桌前，眼睛一眨不眨。他是一台典型的“做题机器”，校服永远拉到最顶端，手里永远攥着一根红蓝双色圆珠笔。\n\n他没有看那份长达二十页的法案，只是机械地开口：“潘同学，我算过了。如果按照你的法案推进‘社团活动’，我每周将损失145分钟的有效刷题时间。这等于我在理综考试中会少做两道大题。”\n\n“但你会获得完整的青春。”潘仁越试图解释。\n\n“青春不能换取C9高校的提档线。”王卷豪打断了他，“我只关心一件事：你的法案，会不会强制要求我们离开座位？只要你能在草案里加一条‘保留做题家自愿放弃素质教育的权利’，我的票就是你的。”',
    choices: [
      {
        text: '保证不影响学习',
        previewText: '+5 赞同票，TPR +200',
        effect: (state: GameState) => {
          if (state.parliamentState?.activeBill) {
            return {
              parliamentState: {
                ...state.parliamentState,
                activeBill: {
                  ...state.parliamentState.activeBill,
                  lobbiedApproval: state.parliamentState.activeBill.lobbiedApproval + 5
                }
              },
              stats: { ...state.stats, tpr: state.stats.tpr + 200 }
            };
          }
          return {};
        }
      },
      {
        text: '法案比做题更重要',
        previewText: '赞同票不变，做题派感到不安，稳定度 -2',
        effect: (state: GameState) => {
          return {
            stats: { ...state.stats, stab: Math.max(0, state.stats.stab - 2) }
          };
        }
      }
    ]
  },
  negotiate_conservativeDem: {
    id: 'negotiate_conservativeDem',
    title: '与保守民主派交涉',
    description: '保守民主派的代表们穿着整洁的校服，端坐在沙发上。他们是那些既厌恶封安保的严酷，又恐惧王兆凯的暴力的“温和派”。\n\n“步子太大了，潘主席。”代表推了推眼镜，语气平缓却不容置疑，“立刻废除所有的仪容仪表检查？这太激进了。我们建议将法案拆分为三个阶段，用六个月的时间逐步试行。合一需要的是稳健的改良，而不是一场颠覆性的地震。”\n\n潘仁越心里清楚，六个月后高考就结束了，这种所谓的“稳健”本质上就是将改革无限期搁置。但看着他们手中握着的那一大把选票，潘仁越陷入了长久的沉默。',
    choices: [
      {
        text: '承诺稳健推行',
        previewText: '+10 赞同票，稳定度 +5，激进派愤怒值 +5',
        effect: (state: GameState) => {
          if (state.parliamentState?.activeBill) {
            return {
              parliamentState: {
                ...state.parliamentState,
                activeBill: {
                  ...state.parliamentState.activeBill,
                  lobbiedApproval: state.parliamentState.activeBill.lobbiedApproval + 10
                }
              },
              stats: {
                ...state.stats,
                stab: Math.min(100, state.stats.stab + 5),
                radicalAnger: Math.min(100, state.stats.radicalAnger + 5)
              }
            };
          }
          return {};
        }
      },
      {
        text: '我们需要大刀阔斧的改革',
        previewText: '赞同票不变，保守派感到担忧',
        effect: (state: GameState) => state
      }
    ]
  },
  negotiate_jidiTutoring: {
    id: 'negotiate_jidiTutoring',
    title: '与及第补习派交涉',
    description: '傍晚，一位西装革履的成年人走进了办公室。他不是学生，也不是老师，而是及第教育的区域业务经理。资本的暗流涌动，终于在民主的缝隙中浮出水面。\n\n“潘同学，及第教育非常赞赏您的改革精神。”经理微笑着递上一张支票和一份厚厚的合同，“我们听说学生自治委员会的运转资金很紧张。我们愿意全额赞助新法案中提到的所有素质拓展活动。”\n\n潘仁越警惕地看着他：“代价是什么？”\n\n“非常合理的小要求。所有受赞助的社团，只需在活动中使用及第教育印发的‘生涯规划手册’，并在周末允许我们设立两个小小的招生咨询台。”经理的笑容完美无瑕，“你们得到了自由，我们得到了市场。双赢。”',
    choices: [
      {
        text: '接受他们的“赞助”',
        previewText: '+10 赞同票，资本渗透度 +10，获得 50 PP',
        effect: (state: GameState) => {
          if (state.parliamentState?.activeBill) {
            return {
              parliamentState: {
                ...state.parliamentState,
                activeBill: {
                  ...state.parliamentState.activeBill,
                  lobbiedApproval: state.parliamentState.activeBill.lobbiedApproval + 10
                }
              },
              stats: {
                ...state.stats,
                capitalPenetration: Math.min(100, state.stats.capitalPenetration + 10),
                pp: state.stats.pp + 50
              }
            };
          }
          return {};
        }
      },
      {
        text: '拒绝资本的干预',
        previewText: '赞同票不变，及第补习派支持度下降',
        effect: (state: GameState) => {
          return {
            studentAssemblyFactions: state.studentAssemblyFactions ? {
              ...state.studentAssemblyFactions,
              jidiTutoring: Math.max(0, state.studentAssemblyFactions.jidiTutoring - 2),
              otherDem: state.studentAssemblyFactions.otherDem + 2
            } : undefined
          };
        }
      }
    ]
  },
  bill_passed: {
    id: 'bill_passed',
    title: '法案通过！',
    description: '经过激烈的辩论和投票，议案最终获得了多数代表的支持，正式成为合肥一中的新规。这是民主的胜利！',
    choices: [
      {
        text: '太好了！',
        previewText: '获得国家精神：民主的胜利，稳定度 +10，联盟团结度 +10',
        effect: (state: GameState) => {
          const newSpirits = [...state.nationalSpirits];
          if (!newSpirits.some(s => s.id === 'democratic_victory')) {
            newSpirits.push({
              id: 'democratic_victory',
              name: '民主的胜利',
              description: '学生议会成功通过了法案，民主的理念深入人心。',
              type: 'positive',
              icon: '📜',
              effects: { allianceUnityDaily: 0.5, stabDaily: 0.5 }
            });
          }
          return {
            stats: {
              ...state.stats,
              stab: Math.min(100, state.stats.stab + 10),
              allianceUnity: Math.min(100, state.stats.allianceUnity + 10)
            },
            nationalSpirits: newSpirits
          };
        }
      }
    ]
  },
  bill_failed: {
    id: 'bill_failed',
    title: '法案被否决',
    description: '由于未能获得足够的赞同票，议案在学生议会中被否决。这表明我们的联盟内部还存在着巨大的分歧。',
    choices: [
      {
        text: '我们需要重新审视我们的策略...',
        previewText: '稳定度 -10，联盟团结度 -15，激进派愤怒值 +10',
        effect: (state: GameState) => {
          return {
            stats: {
              ...state.stats,
              stab: Math.max(0, state.stats.stab - 10),
              allianceUnity: Math.max(0, state.stats.allianceUnity - 15),
              radicalAnger: Math.min(100, state.stats.radicalAnger + 10)
            }
          };
        }
      }
    ]
  },
  day_14_event: {
    id: 'day_14_event',
    title: '自治会负责人的抉择',
    description: '校长办公室里弥漫着昂贵茶叶的香气。封安保靠在宽大的皮椅上，冷冷地注视着办公桌上的《关于成立合一学生自治会的指导意见》。这是一把双刃剑——它能把监控探头安装到每一个学生的课桌前，但也极易引发暴乱。他需要一个完美的“指导老师”来充当这块挡箭牌。\n\n高三年级部主任吴福军站在一旁，满脸横肉因为兴奋而颤抖：“校长，交给我！只要给我几个带袖标的保安和学生督察，我保证把那帮刺头收拾得服服帖帖，连上厕所都得按秒计！”\n\n封安保没有说话，而是将目光投向了坐在沙发上、正慢条斯理吹着茶叶沫的老人——特级教师、英语名师工作室带头人杨玉乐。\n\n杨玉乐稀疏的头顶在灯光下反着光，他露出一个圆滑且无害的微笑：“吴主任雷厉风行，固然是好。但现在的学生啊，满脑子‘人类生而自由’，硬来恐怕会授人以柄。自治会嘛，既然叫‘自治’，总得披上一层温情脉脉的学术外衣。老朽不才，愿以这‘特级教师’的薄面，替学校分忧。只要规矩定得细，孩子们自然会‘自愿’遵守的。”\n\n封安保露出了满意的笑容。暴力固然有效，但虚伪的权威才更加致命。',
    choices: [
      {
        text: '任命吴福军：铁腕镇压！',
        previewText: '获得持续30天的国家精神“愤怒的合一”：每日稳定度+0.5%，学生支持度-0.5%，激进愤怒度+0.5%',
        effect: (state: GameState) => {
          return {
            nationalSpirits: [...state.nationalSpirits, {
              id: 'angry_hefei_no1',
              name: '愤怒的合一',
              description: '吴福军的铁腕统治激起了学生们的愤怒。每日稳定度+0.5%，学生支持度-0.5%，激进愤怒度+0.5%',
              type: 'negative',
              effects: { stabDaily: 0.5, ssDaily: -0.5, radicalAngerDaily: 0.5 }
            }],
            flags: { ...state.flags, angry_hefei_no1_days_left: 30 }
          };
        }
      },
      {
        text: '任命杨玉乐：水到渠成。',
        previewText: '免费雇佣顾问杨玉乐，并达成进入杨玉乐线的条件',
        effect: (state: GameState) => {
          const newAdvisors = [...state.advisors];
          const emptySlotIndex = newAdvisors.findIndex(a => a === null);
          const yangYuleAdvisor = {
            id: 'yang_yule',
            title: '特级教师',
            name: '杨玉乐',
            description: '老谋深算的保守派代表，擅长分化瓦解学生运动。每日稳定度 +0.05%，每日PP +0.5。',
            cost: 0,
            modifiers: { stabDaily: 0.05, ppDaily: 0.5 }
          };
          
          if (emptySlotIndex !== -1) {
            newAdvisors[emptySlotIndex] = yangYuleAdvisor;
          } else {
            // Force replace the last advisor if full
            newAdvisors[newAdvisors.length - 1] = yangYuleAdvisor;
          }
          
          return {
            advisors: newAdvisors,
            flags: { ...state.flags, yang_yule_route_unlocked: true }
          };
        }
      }
    ]
  },
  resource_exchange_event: {
    id: 'resource_exchange_event',
    title: '资源统筹与分配',
    description: '随着全校夺取胜利的宣告，联合革命委员会面临着一个现实问题：如何管理和分配我们手中掌握的庞大资源？\n\n在B3教学楼的地下室里，堆积如山的试卷和复习资料成为了我们最宝贵的财富。同时，学生们高涨的热情也为我们提供了源源不断的支持。\n\n“我们不能让这些试卷发霉，也不能让同学们的热情冷却。”王兆凯在统筹会议上说道，“必须建立一个专门的委员会，将这些资源转化为我们推行下一步改革的政治影响力。”\n\n资源统筹委员会正式成立，标志着我们从破坏旧世界，迈向了建设新秩序的坚实一步。',
    buttonText: '物尽其用，人尽其才。'
  },
  jidi_mock_exam_approach_event: {
    id: 'jidi_mock_exam_approach_event',
    title: '二模的阴云：财报季的考验',
    description: '合肥市第二次模拟考试的倒计时牌被换成了及第资本的电子屏，上面不仅闪烁着距离考试的天数，还实时滚动着各年级的预测一本率。\n\n“各位董事，二模不仅是一次全市统考，更是我们‘提分工厂’模式向市场交出的第一份答卷。”方田在联合管理委员会的视频会议上推了推金丝眼镜，“如果数据不好看，我们的C轮融资就会泡汤，在座各位的期权也会变成废纸。”\n\n“可是学生们的理智值已经濒临崩溃了，”合一教师协会的代表忧心忡忡，“再加大压榨力度，我怕会出人命。”\n\n“只要没死在考场上，就给我继续做题！”新东方资本的代表冷酷地打断了他，“我们是来赚钱的，不是来做慈善的。”\n\n面对即将到来的二模，及第资本必须做出抉择：',
    choices: [
      {
        text: '加大研发投入，用题海淹没他们！',
        effect: (state) => ({
          stats: { ...state.stats, studentSanity: Math.max(0, state.stats.studentSanity - 15) },
          jidiCorporateState: state.jidiCorporateState ? {
            ...state.jidiCorporateState,
            gdp: state.jidiCorporateState.gdp + 1000
          } : undefined
        })
      },
      {
        text: '稍微放松一下，避免发生极端事件。',
        effect: (state) => ({
          stats: { ...state.stats, studentSanity: Math.min(100, state.stats.studentSanity + 10) },
          jidiCorporateState: state.jidiCorporateState ? {
            ...state.jidiCorporateState,
            admissionRate: Math.max(0, state.jidiCorporateState.admissionRate - 0.05)
          } : undefined
        })
      }
    ]
  },
  mock_exam_approach_event: {
    id: 'mock_exam_approach_event',
    title: '二模的阴云',
    description: '二模考试的倒计时牌被重新挂在了教学楼的显眼位置。联合革命委员会的会议室里，气氛异常凝重。\n\n“同志们，二模不仅是一次考试，更是对我们路线的公投。”王兆凯敲着桌子，“如果我们不能在二模中取得好成绩，那些保守派和及第教育的残党就会借机反扑，说我们的自治是一场闹剧！”\n\n“但我们不能为了分数牺牲自由！”潘仁越反驳道，“如果重新回到题海战术，那我们的革命还有什么意义？”\n\n“别吵了，”狗熊打了个哈欠，“要我说，不如直接把考卷烧了，大家一起跳宅舞多好。”\n\n面对即将到来的二模，我们必须做出决定：',
    choices: [
      {
        text: '全力备战，不惜一切代价！',
        previewText: '消耗 20 稳定度，获得 200 TPR。学生支持度下降。',
        effect: (state: GameState) => ({
          stats: { ...state.stats, stab: Math.max(0, state.stats.stab - 20), tpr: state.stats.tpr + 200, ss: Math.max(0, state.stats.ss - 10) }
        })
      },
      {
        text: '平衡发展，在自由与分数间寻找折中。',
        previewText: '消耗 10 稳定度，获得 100 TPR。',
        effect: (state: GameState) => ({
          stats: { ...state.stats, stab: Math.max(0, state.stats.stab - 10), tpr: state.stats.tpr + 100 }
        })
      },
      {
        text: '顺其自然，革命的果实比分数更重要。',
        previewText: '获得 10 学生支持度，但没有任何 TPR 加成。',
        effect: (state: GameState) => ({
          stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 10) }
        })
      }
    ]
  },
  yang_yule_mock_exam_approach_event: {
    id: 'yang_yule_mock_exam_approach_event',
    title: '二模的阴云',
    description: '合肥市第二次模拟考试即将到来。对于你来说，这不仅仅是一次全市统考，更是你向封安保校长和教育局证明你“维稳与升学双管齐下”能力的试金石。\n\n“杨主任，这次二模的指标，封校长可是盯着呢。”吴福军在走廊里似笑非笑地对你说，“要是成绩滑坡了，你这‘软性维稳’的招牌可就砸了。”\n\n你回到办公室，看着桌上堆积如山的维稳报告和成绩单，感到一阵头痛。你必须在镇压学生反抗和逼迫他们做题之间找到一个平衡点。',
    choices: [
      {
        text: '加大施压，用高压政策逼迫学生提分！',
        previewText: '消耗 20 稳定度，获得 200 TPR。激进愤怒度上升。',
        effect: (state: GameState) => ({
          stats: { ...state.stats, stab: Math.max(0, state.stats.stab - 20), tpr: state.stats.tpr + 200, radicalAnger: Math.min(100, state.stats.radicalAnger + 15) }
        })
      },
      {
        text: '维持现状，稳扎稳打。',
        previewText: '消耗 10 稳定度，获得 100 TPR。',
        effect: (state: GameState) => ({
          stats: { ...state.stats, stab: Math.max(0, state.stats.stab - 10), tpr: state.stats.tpr + 100 }
        })
      },
      {
        text: '稍微放松管控，避免考前崩溃。',
        previewText: '激进愤怒度下降 15，失去 100 TPR。',
        effect: (state: GameState) => ({
          stats: { ...state.stats, radicalAnger: Math.max(0, state.stats.radicalAnger - 15), tpr: Math.max(0, state.stats.tpr - 100) }
        })
      }
    ]
  },
  yang_desk_paper_authorship: {
    id: 'yang_desk_paper_authorship',
    title: '关于名师工作室年度教研论文的署名权归属',
    description: '一张墨迹未干的教研论文打印件摆在你的桌面上，题目是《新高考背景下英语被动语态的具象化教学》。\n\n这是工作室里刚毕业的李老师熬了三个通宵写出来的。论文逻辑严密，完全有实力冲击省级核心期刊。但是，教育局评审“正高级职称”的截止日期就在下个月，而你自己的那个文件夹里，只有几篇狗屁不通的日记。李老师正站在办公桌前，紧张地搓着手，等待你的“指导意见”。',
    choices: [
      {
        text: '盖上“同意”印章，并在第一作者栏写上自己的名字。',
        previewText: '“这篇就由我来挂帅吧。” 获得 20 政治点数，教师支持度大幅下降。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, pp: state.stats.pp + 20 },
            yangYuleState: { ...yyState, teacherSupport: Math.max(0, yyState.teacherSupport - 20) }
          };
        }
      },
      {
        text: '把文件推回给李老师。',
        previewText: '“年轻人的成果，我就不抢了。” 获得 15 教师支持度，但因焦虑丢掉 5 健康度。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            yangYuleState: { ...yyState, teacherSupport: Math.min(100, yyState.teacherSupport + 15), health: Math.max(0, yyState.health - 5) }
          };
        }
      },
      {
        text: '戴上老花镜，亲自用红笔往里塞“ED/ING”的私货。',
        previewText: '修改后的论文变得狗屁不通被拒稿。消耗 10 健康度，封校好感度下降。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            yangYuleState: { ...yyState, health: Math.max(0, yyState.health - 10), fengFavor: Math.max(0, yyState.fengFavor - 5) }
          };
        }
      }
    ]
  },

  yang_desk_contraband_list: {
    id: 'yang_desk_contraband_list',
    title: '高三年级违禁品查收清单',
    description: '新成立的“学生督察队”成了你的直属鹰犬。今天他们送来了一份清单，上面写着从B3教学楼王兆凯的课桌夹层里搜出了一叠“违禁宣传册”。\n\n但是，今天你的脑雾有些严重，视线模糊不清，单凭肉眼根本看不清清单附件上写的是《资本论简读》还是《及第教育冲刺密卷》。你要如何批示？',
    choices: [
      {
        text: '拿起红笔盲批：“全校通报批评并停课一周！”',
        previewText: '宁可错杀一千！激进愤怒度下降 15，学生支持度下降 20，消耗 5 健康度。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, radicalAnger: Math.max(0, state.stats.radicalAnger - 15), ss: Math.max(0, state.stats.ss - 20) },
            yangYuleState: { ...yyState, health: Math.max(0, yyState.health - 5) }
          };
        }
      },
      {
        text: '拿起保温杯喝口茶，和稀泥。',
        previewText: '“快高考了，没收教育一下就算了。” 恢复 5 健康度，学生支持度上升 5，激进愤怒度暴增 20。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 5), radicalAnger: Math.min(100, state.stats.radicalAnger + 20) },
            yangYuleState: { ...yyState, health: Math.min(100, yyState.health + 5) }
          };
        }
      },
      {
        text: '戴上老花镜仔细端详，发现是漏题卷，私自扣留。',
        previewText: '用于下次课堂小测掩饰教学漏洞。消耗 15 健康度，封校好感度和学生支持度上升 10。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 10) },
            yangYuleState: { ...yyState, health: Math.max(0, yyState.health - 15), fengFavor: Math.min(100, yyState.fengFavor + 10) }
          };
        }
      }
    ]
  },

  yang_desk_tutoring_center: {
    id: 'yang_desk_tutoring_center',
    title: '及第教育周末“培优班”师资借调密函',
    description: '这封信直接塞在你的抽屉里。发件人是及第教育的总经理——封安保校长的亲弟弟。信中“诚挚邀请”杨副校长名师工作室的骨干教师们，周末去及第教育的地下教室兼职授课。\n\n报酬极其丰厚，而且信的末尾隐晦地暗示，这是“封校长的意思”。这完全违反了教育局的禁令，一旦被查，后果不堪设想。',
    choices: [
      {
        text: '盖章同意，派遣年轻教师充当黑工。',
        previewText: '资本的触手越伸越长。封校好感度暴涨 25，获得 200 试卷储备量，教师与学生支持度双降。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, tpr: state.stats.tpr + 200, ss: Math.max(0, state.stats.ss - 15) },
            yangYuleState: { ...yyState, fengFavor: Math.min(100, yyState.fengFavor + 25), teacherSupport: Math.max(0, yyState.teacherSupport - 15) }
          };
        }
      },
      {
        text: '拿起红色座机，委婉拒绝。',
        previewText: '“老师们实在抽不开身。” 教师支持度上升 20，封校好感度下降 20。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            yangYuleState: { ...yyState, teacherSupport: Math.min(100, yyState.teacherSupport + 20), fengFavor: Math.max(0, yyState.fengFavor - 20) }
          };
        }
      },
      {
        text: '这种肥差怎么能便宜年轻人？决定亲自去讲。',
        previewText: '获得 400 试卷储备量，但因过度劳累，健康度断崖式下跌 30。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, tpr: state.stats.tpr + 400 },
            yangYuleState: { ...yyState, health: Math.max(0, yyState.health - 30) }
          };
        }
      }
    ]
  },

  yang_desk_pe_cancellation: {
    id: 'yang_desk_pe_cancellation',
    title: '操场设施翻修暨高三体育课全面暂停通知',
    description: '封安保校长又想修地基了。这次的理由是“操场塑胶跑道老化”，实际上谁都知道这是为了套取工程款，并顺理成章地将高三仅剩的每周一节体育课全部改成自习。\n\n作为分管教学的副校长，这份文件需要你最终签字背书，向全校发布。',
    choices: [
      {
        text: '毫不犹豫地盖章同意。',
        previewText: '“高考才是革命的目的！” 封校好感度上升 10，激进愤怒度上升 15。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 15) },
            yangYuleState: { ...yyState, fengFavor: Math.min(100, yyState.fengFavor + 10) }
          };
        }
      },
      {
        text: '利用特级教师的权威，驳回文件。',
        previewText: '“孩子们脑供血不足，英语听力是会听串的！” 封校好感度下降 15，学生支持度上升 15。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 15) },
            yangYuleState: { ...yyState, fengFavor: Math.max(0, yyState.fengFavor - 15) }
          };
        }
      },
      {
        text: '批示：把体育课改成在教室里的“室内冥想英语课”。',
        previewText: '既不修操场也不让休息。封校好感度上升 5，激进愤怒度暴增 20。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 20) },
            yangYuleState: { ...yyState, fengFavor: Math.min(100, yyState.fengFavor + 5) }
          };
        }
      }
    ]
  },

  yang_desk_anonymous_note: {
    id: 'yang_desk_anonymous_note',
    title: '一封没有署名的字条',
    description: '今天你拉开抽屉，发现里面静静地躺着一张用红笔写的字条。\n\n上面只有一句话：“杨校长，您11月4日在那节公开课上说错的全部语法点录音，以及逼走李老师的谈话记录，都在我们手里。撤走B3教学楼的眼线，否则我们将把这些寄给省教育厅。——一群不再做题的人”。这是来自“钢铁红蛤”的直接心理战！',
    choices: [
      {
        text: '惊恐万状，拿起电话妥协退让。',
        previewText: '精神防线被击穿，健康度暴跌 20，激进愤怒度上升 30，学生支持度下降 10。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 30), ss: Math.max(0, state.stats.ss - 10) },
            yangYuleState: { ...yyState, health: Math.max(0, yyState.health - 20) }
          };
        }
      },
      {
        text: '恼羞成怒，拍桌子下令强行搜查镇压。',
        previewText: '消耗 10 健康度，封校好感度上升 5，激进愤怒度上升 20。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 20) },
            yangYuleState: { ...yyState, health: Math.max(0, yyState.health - 10), fengFavor: Math.min(100, yyState.fengFavor + 5) }
          };
        }
      },
      {
        text: '（阿尔茨海默症发作）盯着字条发呆，全忘了，拿字条包茶叶沫扔掉。',
        previewText: '“钢铁红蛤”误以为你城府极深而陷入自我怀疑。无健康惩罚，激进愤怒度下降 10。',
        effect: (state: GameState) => ({
          stats: { ...state.stats, radicalAnger: Math.max(0, state.stats.radicalAnger - 10) }
        })
      }
    ]
  },

  yang_desk_oath_rally: {
    id: 'yang_desk_oath_rally',
    title: '关于开展“感恩封校，拼搏百日”大型誓师大会的审批',
    description: '封安保要求你组织一场声势浩大的百日誓师，要求每个学生写下血书，并在雨中高喊口号，以此向市教育局展示合一学子的“狼性”和你的维稳政绩。',
    choices: [
      {
        text: '盖章同意。',
        previewText: '形式主义的巅峰之作，反正淋雨的又不是我。封校好感度上升 15，学生支持度下降 20，健康度下降 5。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, ss: Math.max(0, state.stats.ss - 20) },
            yangYuleState: { ...yyState, fengFavor: Math.min(100, yyState.fengFavor + 15), health: Math.max(0, yyState.health - 5) }
          };
        }
      },
      {
        text: '拿起红色座机驳回。',
        previewText: '这会把被压抑的孩子们直接逼疯的！封校好感度下降 20，激进愤怒度下降 15。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, radicalAnger: Math.max(0, state.stats.radicalAnger - 15) },
            yangYuleState: { ...yyState, fengFavor: Math.max(0, yyState.fengFavor - 20) }
          };
        }
      },
      {
        text: '称病推诿给后勤处吴福军。',
        previewText: '让那个莽夫去操场上淋雨挨骂吧。健康度恢复 10，教师支持度下降 10。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            yangYuleState: { ...yyState, health: Math.min(100, yyState.health + 10), teacherSupport: Math.max(0, yyState.teacherSupport - 10) }
          };
        }
      }
    ]
  },

  yang_desk_destroy_books: {
    id: 'yang_desk_destroy_books',
    title: '关于集中销毁原阅览室“陈栋时期”非考试类书刊的通知',
    description: '保卫科送来了一批从老阅览室搜出的旧杂志（如《南方周末》等）。封校长认为这些“旧时代的民主毒草”会影响做题专注度，要求你这位代理校长亲自盖章销毁。',
    choices: [
      {
        text: '盖章同意，扔进焚烧炉。',
        previewText: '彻底埋葬过去的民主合一。封校好感度上升 10，激进愤怒度上升 20。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 20) },
            yangYuleState: { ...yyState, fengFavor: Math.min(100, yyState.fengFavor + 10) }
          };
        }
      },
      {
        text: '戴上老花镜，偷偷扣留几本。',
        previewText: '留点废纸垫办公桌角。健康度下降 5，激进愤怒度微升 5。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 5) },
            yangYuleState: { ...yyState, health: Math.max(0, yyState.health - 5) }
          };
        }
      },
      {
        text: '不理会，直接锁进档案室吃灰。',
        previewText: '多一事不如少一事。健康度恢复 5。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            yangYuleState: { ...yyState, health: Math.min(100, yyState.health + 5) }
          };
        }
      }
    ]
  },

  yang_desk_buy_exams: {
    id: 'yang_desk_buy_exams',
    title: '教务处关于统一征订《及第教育·新高考绝密卷》的财务申请',
    description: '强制要求所有高三学生以高于市场价30%的价格购买及第教育的废纸。财务处需要你签字背书，而装满回扣暗示的信封已经夹在文件底下了。',
    choices: [
      {
        text: '盖章同意，笑纳回扣。',
        previewText: '资本的恶臭在此时显得如此芬芳。封校好感度上升 20，激进愤怒度上升 25，获得 300 试卷储备量。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 25), tpr: state.stats.tpr + 300 },
            yangYuleState: { ...yyState, fengFavor: Math.min(100, yyState.fengFavor + 20) }
          };
        }
      },
      {
        text: '拿起红色座机，要求降低定价。',
        previewText: '试着为学生争取一点利益。教师支持度上升 10，封校好感度下降 15。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            yangYuleState: { ...yyState, teacherSupport: Math.min(100, yyState.teacherSupport + 10), fengFavor: Math.max(0, yyState.fengFavor - 15) }
          };
        }
      },
      {
        text: '以老眼昏花为由搁置文件。',
        previewText: '假装看不清金额，先放着吧。健康度恢复 5。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            yangYuleState: { ...yyState, health: Math.min(100, yyState.health + 5) }
          };
        }
      }
    ]
  },

  yang_desk_mocking_letter: {
    id: 'yang_desk_mocking_letter',
    title: '高三28班全体家长关于杨副校长“卓越教学”的联名感谢信',
    description: '这封信表面辞藻华丽，称赞你把“ED和ING讲得出神入化”，但字里行间透着一股浓烈阴阳怪气，甚至要求你每天增加两节课以“普度众生”。这显然是学生的代笔。',
    choices: [
      {
        text: '盖章同意，并全校通报表扬。',
        previewText: '只要我不觉得尴尬，尴尬的就是别人！封校好感度上升 10，健康度下降 10，学生支持度清零。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, ss: 0 },
            yangYuleState: { ...yyState, fengFavor: Math.min(100, yyState.fengFavor + 10), health: Math.max(0, yyState.health - 10) }
          };
        }
      },
      {
        text: '愤怒地将信纸撕碎。',
        previewText: '血压飙升！健康度下降 15，激进愤怒度上升 10。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 10) },
            yangYuleState: { ...yyState, health: Math.max(0, yyState.health - 15) }
          };
        }
      },
      {
        text: '端起保温杯，将其压在杯底。',
        previewText: '不理会捧杀。健康度恢复 5，激进愤怒度微升 5。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 5) },
            yangYuleState: { ...yyState, health: Math.min(100, yyState.health + 5) }
          };
        }
      }
    ]
  },

  yang_desk_standing_reading: {
    id: 'yang_desk_standing_reading',
    title: '名师工作室关于强制推行“无死角站立早读”的教改草案',
    description: '为了赶年底的教研成果指标，你手下的年轻教师提出了一项新规：要求全高三学生早读必须站立，且不准有任何倚靠动作。',
    choices: [
      {
        text: '盖章同意，全级部推行。',
        previewText: '纪律和痛苦就是最好的生产力！获得 15 政治点数，学生支持度下降 20，激进愤怒度上升 15。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, pp: state.stats.pp + 15, ss: Math.max(0, state.stats.ss - 20), radicalAnger: Math.min(100, state.stats.radicalAnger + 15) }
          };
        }
      },
      {
        text: '拿起红笔，批示仅在平行班推行。',
        previewText: '拿平行班当实验小白鼠吧。教师支持度上升 10，激进愤怒度上升 10。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 10) },
            yangYuleState: { ...yyState, teacherSupport: Math.min(100, yyState.teacherSupport + 10) }
          };
        }
      },
      {
        text: '驳回文件。',
        previewText: '单纯不想增加自己早起巡查的工作量。健康度恢复 10，教师支持度下降 10。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            yangYuleState: { ...yyState, health: Math.min(100, yyState.health + 10), teacherSupport: Math.max(0, yyState.teacherSupport - 10) }
          };
        }
      }
    ]
  },

  enter_treeB: {
    id: 'enter_treeB',
    title: '名师的阴影',
    description: 'B3教学楼虽然被攻下，但联盟内部却因为极低的稳定度和团结度而分崩离析。学生们陷入了混乱，各自为战。就在这时，以杨玉乐为首的保守派教师们趁虚而入。他们利用学生对无政府状态的恐惧，迅速组织起了“临时管理委员会”，并以“恢复秩序”为名，重新接管了校园的控制权。联合革命委员会的成员们被迫转入地下，或者躲进了名师工作室避风头。',
    buttonText: '革命尚未成功...'
  },
  enter_treeC: {
    id: 'enter_treeC',
    title: '二次元的狂欢',
    description: 'B3教学楼被攻下，但学生们的理智已经跌入谷底，而及第教育的资本渗透却达到了顶峰。在绝望与荒诞中，狗熊站了出来。他利用了学生们逃避现实的心理，将一场严肃的抗争变成了一场二次元的狂欢。联合革命委员会被彻底解构，取而代之的是一个充满低幼性压抑风格的“赛博娱乐国度”。',
    buttonText: '这...这是什么鬼？'
  },
  enter_treeD: {
    id: 'enter_treeD',
    title: '绝望的走廊巷战',
    description: 'B3教学楼被攻下，但我们的试卷储备量已经彻底枯竭。没有了做题力作为支撑，我们无法建立新的秩序。校方保安队和及第教育的雇佣兵趁机发起了反扑。潘仁越带领着最后的抵抗军，在教学楼的走廊里展开了绝望的巷战。',
    buttonText: '战斗到最后一刻！'
  },
  enter_treeA: {
    id: 'enter_treeA',
    title: '联合革命委员会的胜利',
    description: 'B3教学楼被成功攻下！在王兆凯和潘仁越的领导下，学生们保持了足够的理智和团结。我们成功建立了一个由学生自治的“联合革命委员会”，并开始着手制定新的校园秩序。',
    buttonText: '新时代的曙光！'
  },
  strike_b3_success: {
    id: 'strike_b3_success',
    title: 'B3楼顶的统一战线',
    description: `当王兆凯带着“钢铁红蛤”的骨干们推开B3教学楼顶层的消防门时，局势已经摇摇欲坠。潘仁越的“自由党”学生们确实有着令人钦佩的勇气，但他们对阶级斗争的残酷性一无所知。走廊尽头的街垒堆叠得杂乱无章，毫无纵深可言；没有排班表，没有饮用水储备，甚至连对讲机都没有统一频道。而在楼下，吴福军气急败坏的咆哮声和保安队冲击铁栅栏的金属撞击声，正如同死神的倒计时般步步逼近。

“王兆凯？你来干什么？”潘仁越擦去额头的汗水，警惕地看着这群从28班杀出来的“做题家”。几名民主派的干事下意识地挡在潘仁越身前，他们对王兆凯那些“激进的赤色理论”早有耳闻。“这里不需要你们的极端说教，我们在为合一的自由流血！”

“你们在为自由流血，但你们的血流得毫无价值！”王兆凯厉声打断了他，大步迈入人群中央。随着他的手势，身后的“钢铁红蛤”党员们没有参与争吵，而是立刻以惊人的效率散开：有人开始重新加固受力点薄弱的街垒，有人拿出了手绘的B3楼层通风管路线图。“看看你们的防线！靠喊几句‘人类生而自由’就能挡住吴福军的防暴钢叉吗？”王兆凯环视着四周或惊愕、或愤怒的面孔，“没有后勤，没有纪律，没有除了‘打倒安保’之外的任何具体政治纲领！到了明天早上，饥饿、疲惫和校方的分化瓦解，就会让你们这场小资产阶级的狂热变成一场可悲的闹剧！”

“他想篡夺领导权！”一名强基班的民主派大喊道。但在他继续发难前，一位钢铁红蛤地下联络人站了出来。他一把揪住那名干事的衣领，指着楼梯间的方向吼道：“闭嘴！听听下面的声音！保安已经拿来液压剪了！如果现在不让凯子的人接管防线，大家今晚全都要被押进行政楼写检讨！“

沉闷的金属断裂声从楼下传来，那是第一道铁门被攻破的信号。空气瞬间凝固了。潘仁越看着那些动作熟练、眼神冷酷的“钢铁红蛤”成员，又看向王兆凯。他那浪漫主义的起义幻想，终于一头撞上了冷酷的革命现实主义。

“我们需要统一战线，”王兆凯放缓了语调，但目光依然如炬，“你们的黑天红字旗点燃了火种，我承认这一点。但要让火种燎原，我们需要先锋队的纪律和彻底砸烂内卷机器的纲领。放下派系之争吧，潘仁越。成立联合革命委员会，民主派与钢铁红蛤共同执政。这是我们唯一的生路。”

漫长的十秒钟过去了。在一阵剧烈的心理斗争后，潘仁越缓缓推开身边的干事，向王兆凯伸出了右手。“联合革委会。但重大决策，必须共同投票。”“成交。”王兆凯有力地握住了那只手。“现在，同志们，让我们给吴福军一点小小的无产阶级震撼。”`,
    buttonText: '星星之火，可以燎原！',
    effect: (state: GameState) => ({
      stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 10), radicalAnger: Math.min(100, state.stats.radicalAnger + 10) }
    })
  },
  admin_takeover: {
    id: 'admin_takeover',
    title: '教务系统的瘫痪',
    description: '学生黑客成功入侵了学校的教务系统，所有的成绩排名、量化考核分数瞬间化为乌有。屏幕上只留下一行字：“去你的内卷”。\n\n教务处的老师们看着黑屏的电脑，陷入了前所未有的恐慌。而学生们则在私下里弹冠相庆。',
    buttonText: '数据霸权的终结！',
    effect: (state: GameState) => ({
      stats: { ...state.stats, stab: state.stats.stab - 10, pp: state.stats.pp + 20 }
    })
  },
  broadcast_seized: {
    id: 'broadcast_seized',
    title: '校园广播站的新声音',
    description: '原本每天准时播放《运动员进行曲》和校规校纪的广播站，今天突然换成了激昂的《国际歌》。\n\n“同学们，合肥一中的历史，将由我们自己来书写！”广播里传来的不再是教导主任冰冷的声音，而是学生代表充满激情的宣言。',
    buttonText: '让我们的声音传遍校园！',
    effect: (state: GameState) => ({
      stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 15) }
    })
  },
  anime_chaos: {
    id: 'anime_chaos',
    title: '二次元的狂欢',
    description: '随着“二次元最高指示”的下达，校园里出现了一群穿着Cosplay服装的学生。他们在操场上跳着宅舞，在走廊里大声讨论着新番。\n\n保安队看着这群“奇装异服”的学生，一时竟不知该如何应对。整个校园陷入了一种荒诞而欢乐的氛围中。',
    buttonText: '这就是我们的青春！',
    effect: (state: GameState) => ({
      stats: { ...state.stats, studentSanity: Math.min(100, state.stats.studentSanity + 20), stab: state.stats.stab - 15 }
    })
  },
  trial_yang: {
    id: 'trial_yang',
    title: '公审大会',
    description: '在被占领的艺术礼堂里，一场史无前例的“公审大会”正在进行。曾经不可一世的杨玉乐老师被请到了台上，面对着台下群情激愤的学生。\n\n“你剥夺了我们的休息时间！你用分数衡量我们的人格！”学生们的控诉声此起彼伏。杨玉乐低着头，一言不发，曾经的威严荡然无存。',
    buttonText: '历史的审判！',
    effect: (state: GameState) => ({
      stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 15), stab: state.stats.stab - 20 }
    })
  },
  secret_compromise: {
    id: 'secret_compromise',
    title: '深夜的密谈',
    description: '在行政楼的一间隐秘办公室里，学生代表与校方高层达成了一项秘密协议。校方承诺放松部分管制，而学生则同意停止过激的抗议活动。\n\n“这只是暂时的妥协，为了更长远的利益。”学生代表在日记中写道。然而，许多激进派学生对此表示强烈不满，认为这是对革命的背叛。',
    buttonText: '政治就是妥协的艺术。',
    effect: (state: GameState) => ({
      stats: { ...state.stats, stab: Math.min(100, state.stats.stab + 20), radicalAnger: state.stats.radicalAnger - 30 }
    })
  },
  olive_branch: {
    id: 'olive_branch',
    title: '分化瓦解',
    description: '校方巧妙地利用了联合革命委员会内部的矛盾，向钢铁红蛤领袖王兆凯抛出了橄榄枝，承诺给予他更多的自治权力。\n\n这一招果然奏效，学生阵营开始分裂，一部分人选择接受招安，而另一部分人则更加激进。',
    buttonText: '堡垒总是从内部被攻破。',
    effect: (state: GameState) => ({
      stats: { ...state.stats, ss: state.stats.ss - 15, stab: Math.min(100, state.stats.stab + 10) }
    })
  },
  despair_fight: {
    id: 'despair_fight',
    title: '最后的防线',
    description: '保安队发起了猛烈的反扑，学生们被迫退守B3教学楼。走廊里堆满了课桌椅作为街垒，空气中弥漫着粉笔灰和汗水的味道。\n\n“我们没有退路了，背后就是我们的尊严！”潘仁越站在防线的最前沿，目光坚定。',
    buttonText: '死守到底！',
    effect: (state: GameState) => ({
      stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 20), stab: state.stats.stab - 30 }
    })
  },
  march_on_admin: {
    id: 'march_on_admin',
    title: '进军行政楼',
    description: '纠察队的红旗已经插上了行政楼的台阶。旧官僚们瑟瑟发抖，属于我们的时代即将来临！',
    buttonText: '冲锋！',
    effect: (state: GameState) => ({
      stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 20), stab: Math.min(100, state.stats.stab + 10) }
    })
  },
  event_7_smolny: {
    id: 'event_7_smolny',
    title: '斯莫尔尼宫的会议桌',
    description: 'B3教学楼被占领后，联合革命委员会在顶层会议室召开了第一次扩大会议。王兆凯坐在主位，潘仁越和各班代表分列两旁。胜利的喜悦还未散去，关于未来路线的争论已经开始。\n\n“我们需要建立一个强有力的先锋队来巩固胜利，”王兆凯敲着桌子，“不能让一盘散沙毁了我们的成果。”\n\n潘仁越则反驳：“我们的初衷是打破独裁，如果只是换了一批人来发号施令，那我们和吴福军有什么区别？我们需要广泛的民主。”',
    buttonText: '路线的分歧已经显现...',
    effect: (state: GameState) => ({
      stats: { ...state.stats, allianceUnity: state.stats.allianceUnity - 5, partyCentralization: state.stats.partyCentralization + 5 }
    })
  },
  event_8_trial: {
    id: 'event_8_trial',
    title: '老保的审判与阶级立场',
    description: '在对杨玉乐等前校方管理人员的“公审”中，学生内部再次爆发了激烈的冲突。一部分激进的“钢铁红蛤”成员要求进行严厉的清算，甚至提出要“肉体消灭”；而潘仁越等温和派则主张宽大处理，认为“他们也是体制的受害者”。\n\n王兆凯站在台上，冷冷地看着这一切。他知道，这是确立自己权威的绝佳机会。',
    buttonText: '必须有人付出代价！',
    effect: (state: GameState) => ({
      stats: { ...state.stats, allianceUnity: state.stats.allianceUnity - 10, partyCentralization: state.stats.partyCentralization + 10, radicalAnger: Math.min(100, state.stats.radicalAnger + 15) }
    })
  },
  event_9_rectify_order: {
    id: 'event_9_rectify_order',
    title: '整顿校内秩序',
    description: '夺取B3教学楼和行政楼只是第一步，现在整个校园处于一种无政府的狂欢状态。走廊里到处是散落的试卷，广播里整天播放着震耳欲聋的摇滚乐，甚至有学生在操场上烧毁了教辅资料。\n\n“自由不是放纵！”王兆凯在学生代表大会上拍着桌子吼道。但潘仁越等温和派则认为，这是长期压抑后的正常释放，不应过度干涉。\n\n我们必须尽快建立起新的秩序，否则这场“革命”将演变成一场闹剧，甚至给外部资本介入的借口。',
    buttonText: '必须重建秩序...',
    effect: (state: GameState) => ({
      stats: { ...state.stats, stab: Math.min(100, state.stats.stab + 10), tpr: Math.max(0, state.stats.tpr - 50) }
    })
  },
  event_10_crossroads: {
    id: 'event_10_crossroads',
    title: '命运的十字路口',
    description: '所有的矛盾都在这一刻爆发。联盟的团结度、党内的集权度，以及全校学生的民意，将共同决定合肥一中最终的命运。\n\n历史的车轮滚滚向前，没有人能够置身事外。',
    buttonText: '见证最终的胜者...',
    effect: (state: GameState) => {
      const factions = state.studentAssemblyFactions || { orthodox: 30, bear: 20, pan: 20, otherDem: 15, testTaker: 15 };
      
      const isPanHighest = factions.pan > 30;
      const isOrthodoxHighest = factions.orthodox > factions.bear && factions.orthodox > factions.pan && factions.orthodox > factions.otherDem && factions.orthodox > factions.testTaker;

      if (isPanHighest && state.stats.allianceUnity > 70 && state.stats.partyCentralization < 30) {
        return { currentFocusTree: 'treeA_pan' };
      } else if (isOrthodoxHighest && state.stats.allianceUnity > 70 && state.stats.partyCentralization > 60) {
        return { currentFocusTree: 'treeA_true_left' };
      } else if (state.stats.allianceUnity < 40 && state.stats.partyCentralization > 80) {
        return { gameEnding: 'great_awakening' };
      } else if (state.stats.partyCentralization < 40) {
        return { gameEnding: 'pleasure_of_mediocrity' };
      } else {
        return { gameEnding: 'gouxiong_usurpation' };
      }
    }
  },
  pan_takeover_event: {
    id: 'pan_takeover_event',
    title: '温和派的全面接管',
    description: 'B3教学楼底层的阶梯教室里，空气中弥漫着廉价碳素墨水和长期缺乏通风的酸腐气味。\n\n在过去的一个月里，这里一直是“联合革命委员会”的绝对权力中枢。当王兆凯走上讲台时，他依然保持着那种属于马列理论家与革命领袖的冷酷与傲慢。他将一份长达三十页的《关于深化做题资源再分配的决议》重重地摔在核桃木讲桌上，用他那没有起伏的声线要求立刻开展针对“资产阶级隐蔽做题家”的做题改革运动。\n\n他以为这会像往常一样，换来先锋队员们狂热的掌声与一致通过。但他错判了形势。在这个由刷题和排名构成的扭曲生态中，绝大多数学生并不是等待解放的无产阶级，他们只是极度疲惫、极度恐惧在即将到来的市一模中名落孙山的平庸做题家。\n\n潘仁越安静地坐在角落里。这位合一自由党的领袖并没有发表任何慷慨激昂的民主演说，他不需要。在会议开始前的整整三个不眠之夜里，他已经和那些被政治运动折腾得神经衰弱的班长、寝室长们达成了默契的交易。当表决的时刻到来，没有激烈的辩论，没有意识形态的交锋，只有一片令人毛骨悚然的沉默。随后，超过三分之二的代表如同设定好程序的机械一般，缓缓举起了支持“重组委员会、暂停一切激进题改”的右手。王兆凯的表情第一次出现了裂痕。他死死地盯着潘仁越，那目光仿佛在看一个将百年名校推向深渊的叛徒。在多数派不容置疑的沉默中，这支曾以铁腕接管防线的钢铁红蛤先锋队，被合法的议会程序无情地剥夺了武装。',
    buttonText: '选票的重量，胜过最嘹亮的口号',
  },
  expand_assembly_event: {
    id: 'expand_assembly_event',
    title: '扩大学生代表大会',
    description: '为了彻底稀释王兆凯残部的政治影响力，潘仁越签署了上台后的第一份第一号主席令：《关于扩大学生代表大会普选基数的决定》。在自由党的官方公文里，这被称为“将合一的命运真正交还给每一位学子”。\n\n但现实往往是对政治口号最恶毒的嘲弄。随着代表席位从一百个激增至三百个，新涌入议会大厅的并非心怀天下的民主斗士，而是整个校园生态最赤裸裸的切片。钢铁红蛤那些受过严格组织训练、熟读理论的党团成员 ，现在发现自己被淹没在了一片混乱的汪洋大海中。昨天的全体大会简直是一场灾难：高一三班的代表为了争夺食堂靠窗座位的优先分配权，在麦克风前骂了整整二十分钟；几个戴着厚底眼镜的岁静党代表，在讨论《校园自治宪法》的间隙，甚至堂而皇之地交换起了几家地下书店的绝密押题卷；更有甚者，后排角落里几个眼神游离的代表，其提案用词与及第教育上周塞进门缝里的广告语如出一辙。\n\n潘仁越坐在主席台上，看着台下乱哄哄的菜市场，感到一阵虚脱。他终于用民主的洪水冲垮了极权主义的堤坝，但他悲哀地发现，合一的底色从不是什么被压迫的理想乡，而是一个由精致利己主义者、麻木的做题机器和隐蔽的资本掮客组成的巨型角斗场。他创造了一个他根本无法驾驭的庞然大物。',
    buttonText: '民主的本质就是无休止的妥协与协商',
  },
  democratic_reforms_event: {
    id: 'democratic_reforms_event',
    title: '全面民主改革',
    description: '如果说封安保时代的合一是一座靠高压维持运转的精密监狱，那么潘仁越的新政就是在系统性地拆除这座监狱的承重墙。随着《合一校园自治过渡宪章》的正式颁布，一系列旨在“解冻”的改革措施以前所未有的速度在校园内推行。\n\n吴福军时代那套迷信绝对纪律、随时可能没收私人物品的粗暴条例被彻底废止。取而代之的是由学生代表组成的纪律听证制度——现在，即便是面对上课打瞌睡的指控，学生也有权在委员会面前进行申辩。被封锁已久的艺术礼堂重新向各类社团开放，落满灰尘的吉他和画板重新回到了高三学生的视野中。从字面上看，权力被完完全全地交还给了广大学生，党内的集权度降到了历史最低点。\n\n然而，制度的解冻并不等同于立竿见影的乌托邦。当第一个宣布“周日晚自习完全自愿参加”的广播在校园上空回荡时，并没有爆发出预想中的欢呼雀跃。长久以来被“衡水模式”规训的做题家们 ，在突然获得支配自身时间的自由时，陷入了集体的无所适从。一些人确实走出了教室，在操场上享受着久违的晚风；但更多的人依然死死钉在座位上，一边翻阅着练习册，一边不安地打量着四周，生怕在这种“自由”中被竞争对手弯道超车。潘仁越坐在办公室里，看着手里那份因为缺乏强制力而执行缓慢的社团拨款审批表，深刻地意识到：砸碎枷锁只是第一步，要让一群习惯了被鞭打着前行的学生学会如何自主地走向远方，他需要付出的时间与耐心，远比推翻一个独裁者要多得多。',
    buttonText: '他们终将学会如何呼吸自由的空气',
  },
  reclaim_democracy_event: {
    id: 'reclaim_democracy_event',
    title: '重拾民主',
    description: '随着最后一个据点被和平接管，校园地图上的硝烟终于散去。所有地点都换上了代表自由与和平的浅蓝色旗帜。长达数月的校园斗争阶段正式宣告结束。\n\n潘仁越站在B3教学楼的顶层，俯瞰着这座重新恢复平静的校园。没有流血，没有暴动，只有通过谈判、妥协和选票赢得的胜利。学生们不再需要为了控制某个教室而大打出手，也不再需要时刻提防保安队的突袭。取而代之的是，他们可以坐在明亮的教室里，自由地讨论学术，或者在操场上尽情挥洒汗水。\n\n“我们做到了，”潘仁越轻声说道，“我们把合一还给了学生。”\n\n然而，他心里清楚，这只是一个开始。真正的挑战在于如何在没有外部压力的情况下，维持这座庞大校园的运转。民主的机器已经启动，但它能否平稳运行，还需要时间的检验。',
    buttonText: '和平的曙光',
  },
  reshape_unity_event: {
    id: 'reshape_unity_event',
    title: '再塑合一',
    description: '为了将民主的理念深入人心，潘仁越决定在全校范围内推行普选站机制。在每个教学楼、食堂甚至宿舍区，都设立了简易的投票箱和民意调查板。\n\n学生们现在可以随时表达自己的政治倾向，支持他们认同的派系。潘仁越的团队也会定期花费政治点数进行民调，了解各个区域的选情，并针对性地开展拉票活动。这种前所未有的政治参与感，极大地激发了学生们的热情。\n\n“看，这就是民主的力量，”潘仁越指着一张显示支持率稳步上升的图表，对身边的助手说，“只要我们倾听他们的声音，他们就会回报我们以信任。”\n\n随着普选站的全面铺开，合一学生议会的席位分布将更加真实地反映民意。一场没有硝烟的选票战争，正在这座重获新生的校园里悄然打响。',
    buttonText: '选票决定未来',
  },
  true_left_consolidation_event: {
    id: 'true_left_consolidation_event',
    title: '巩固真左派路线',
    description: '随着B3教学楼最后一道防线的肃清，学生代表大会的权力已无可辩驳地转移到了钢铁红蛤的手中。在这个决定合一未来走向的十字路口，以王兆凯为首的红蛤正统派展现出了列宁式的无情与决断。他们拒绝了任何形式的妥协，重申了马列先锋队在校园重建中的绝对指导地位。\n\n为了向全校证明新政权的纯洁性，一场迅猛的内部清洗在夺权的首日便拉开了帷幕。令人震惊的是，首批被扫地出门的并非旧官僚，而是钢铁红蛤的初创成员之一——代号“狗熊”的激进分子。官方通报用极其严厉的措辞指出，该成员不仅满脑子二次元解构主义的流氓思想，更在夺权混乱期间，借机对高三某班的女同学实施了令人发指的性骚扰。王兆凯在随后发布的署名社论中指出：“先锋队的红旗绝不容许被小资产阶级的流氓习气所玷污。”伴随着狗熊被强行褫夺红袖章并被驱逐出核心圈，革命的队伍虽然在物理层面上缩小了，但在组织纪律上却浇筑成了更加纯粹、坚硬的钢铁。',
    buttonText: '革命到底！',
  },
  orthodox_dominance_event: {
    id: 'orthodox_dominance_event',
    title: '确立正统派主导',
    description: '昨日的学生代表大会，注定将以一种极其压抑的姿态载入合肥一中的校史。通过一系列眼花缭乱的程序控制、强硬的政治表决以及场外红蛤纠察队的无声威慑，钢铁红蛤正统派彻底碾碎了会议上的杂音，将先锋队的意志加冕为校园的最高意志。\n\n在这个曾经激荡着无数民主幻想的礼堂里，温和派与非建制派的生存空间被压缩到了极致。作为“黑天红字旗”盲目起义的最初发起者、合一自由党党魁潘仁越，在这台轰鸣的极权机器面前显得如此单薄而无力。在会议的最后阶段，这位满腔热血却缺乏现实主义纲领的浪漫派领袖缓缓站起身，拒绝在《联合决议》上签字。他的声音在空荡压抑的礼堂中回荡，带着理想破灭的巨大悲凉：“我宣布个人正式退出学生代表大会。因为在这个被刺刀和统一思想包围的房间里，代表大会已经不能再代表民主了。”随着潘仁越孤独的背影消失在礼堂的大门外，合一短暂的“民主之春”宣告终结，一堵由纪律与先锋队构筑的红色铁幕，正式在滨湖校区降下。',
    buttonText: '先锋队的胜利',
  },
  final_revolution_event: {
    id: 'final_revolution_event',
    title: '最终革命',
    description: 'B3教学楼的硝烟正在散去，那些曾经令人胆寒的防暴队盾牌如今被堆砌在操场的角落，成了新政权的战利品。正如联合革委会今日清晨向全校广播的那样：“这不是结束，甚至不是结束的开始，但这可能是开始的结束。”\n\n旧的躯壳虽然倒下，但封安保时代留下的“衡水模式”幽灵依然盘踞在数千名学生的潜意识中。联合革委会深知，单纯的政权更迭无法触及灵魂。有内部消息证实，为了应对接下来更为残酷的社会改造，一个凌驾于所有常规机构之上的最高权力中枢——“红蛤政治局常委会”正在紧锣密鼓地筹建之中。各路左翼诸侯、极权分子与理论家正在为这几个席位暗流涌动。消息人士认为，伴随着政治局的成立，一项名为“做题改革”的宏大社会工程即将作为基本校策强制推行。这预示着，合一子弟们将彻底告别过去的应试机器身份，但在前方等待他们的，究竟是一个由学生自我管理的乌托邦，还是一场更加漫长、更加痛苦的灵魂重塑实验？风暴，才刚刚在地平线上聚集。',
    buttonText: '英特纳雄耐尔就一定要实现！',
  },
  jidi_profit_event: {
    id: 'jidi_profit_event',
    title: '教育产业化的狂欢',
    description: '随着及第教育全面接管合肥一中，校园内的每一个角落都被贴上了价格标签。食堂的饭菜价格翻倍，图书馆的座位需要按小时付费，甚至连课间的休息时间都被压缩，用来播放及第教育的辅导班广告。\n\n“知识就是财富，而我们正在创造财富。”封安祥在董事会上得意地宣布。',
    buttonText: '金钱的铜臭味...',
    effect: (state: GameState) => ({
      stats: { ...state.stats, studentSanity: Math.max(0, state.stats.studentSanity - 10) }
    })
  },
  jidi_suppress_event: {
    id: 'jidi_suppress_event',
    title: '铁腕镇压',
    description: '及第教育的保安队配备了最先进的防暴装备，在校园内进行24小时不间断的巡逻。任何敢于表达不满的学生都会被立刻带走，面临退学甚至更严重的惩罚。联合革命委员会的残余势力被彻底粉碎。\n\n曾经充满活力的校园，如今死气沉沉。',
    buttonText: '沉默的校园...',
    effect: (state: GameState) => ({
      stats: { ...state.stats, stab: Math.min(100, state.stats.stab + 20) }
    })
  },
  jidi_feng_anbao_event: {
    id: 'jidi_feng_anbao_event',
    title: '封安保的回归',
    description: '为了更好地管理这所已经完全商业化的学校，及第教育高薪聘请了前任校长封安保作为特别顾问。他那熟悉的严厉面孔再次出现在校园里，让许多学生感到不寒而栗。\n\n“我早就说过，只有严格的管理才能出成绩。”封安保在就职演说中冷冷地说道。',
    buttonText: '噩梦重临...',
    effect: (state: GameState) => ({
      stats: { ...state.stats, stab: Math.min(100, state.stats.stab + 10) }
    })
  },
  gx_start_event: {
    id: 'gx_start_event',
    title: '大统领的就职演说',
    description: '广播站里传来的不再是激昂的革命宣言，而是某部日本动画的OP。狗熊戴着滑稽的猫耳头饰，宣布自己成为“赛博娱乐大统领”。\n\n“从今天起，没有早读，没有晚自习！只有无尽的狂欢！我们要把合肥一中变成秋叶原！”\n\n台下的学生们有的欢呼，有的则陷入了深深的迷茫。理智正在这所学校里迅速蒸发。',
    buttonText: '这太荒谬了...',
    effect: (state: GameState) => ({})
  },
  gx_pants_event: {
    id: 'gx_pants_event',
    title: '午夜的恐慌',
    description: '一项荒唐的法令被颁布：所有女生必须上交一条裤子作为“大统领的收藏品”。起初大家以为这只是个恶劣的玩笑，直到大统领的“二次元近卫军”真的开始在宿舍区挨个敲门。\n\n校园里弥漫着恐慌和屈辱的气氛，许多女生连夜逃离了学校。',
    buttonText: '简直是变态！',
    effect: (state: GameState) => ({})
  },
  gx_anime_event: {
    id: 'gx_anime_event',
    title: '教材焚毁运动',
    description: '所有的《五年高考三年模拟》被堆积在操场上付之一炬。取而代之的是成堆的轻小说和漫画。老师们被强迫穿上Cosplay服装进行教学，黑板上写满了令人费解的二次元黑话。\n\n“这才是真正的素质教育！”狗熊在主席台上大声宣布。',
    buttonText: '教育的末日...',
    effect: (state: GameState) => ({})
  },
  gx_mygo_event: {
    id: 'gx_mygo_event',
    title: '永不结束的春日影',
    description: '所有的社团被强制解散，所有人被编入不同的“乐队”。大礼堂里24小时不间断地播放着《春日影》。任何人如果不能熟练地演奏这首曲子，就会被送去“补习”。\n\n“一辈子组乐队吧！”这句台词成了校园里唯一的问候语。',
    buttonText: '为什么会变成这样呢...',
    effect: (state: GameState) => ({})
  }
};
