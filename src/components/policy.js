import React from 'react';
import '../css/components/policy.css';

function PolicyPage() {
  const sections = [
    {
      title: "一、資料收集方式",
      content: [
        "當您使用本系統時，我們可能會收集以下類型的資料：",
        "• 帳戶資料：如用戶名稱、電郵地址、登入紀錄",
        "• 健康資料：如體質測評結果、病徵紀錄、醫囑、忌口食物",
        "• 飲食紀錄：進食時間、食物項目、份量、偏好設定",
        "• 系統使用行為：如操作紀錄、裝置資訊、使用時間"
      ]
    },
    {
      title: "二、資料使用目的",
      content: [
        "我們收集的資料將用於以下用途：",
        "• 提供個人化的飲食建議與健康分析",
        "• 優化系統功能與使用者體驗",
        "• 儲存並展示歷史紀錄供用戶查閱"
      ]
    },
    {
      title: "三、資料儲存與保護",
      content: [
        "• 所有資料將儲存於加密伺服器，並採取技術與管理措施防止未經授權存取",
        "• 僅限授權人員可存取資料，並定期進行安全性檢查",
        "• 若需委託第三方處理資料，將要求其遵守保密與安全標準"
      ]
    },
    {
      title: "四、資料分享政策",
      content: [
        "未經您明確同意，我們不會將您的個人資料提供予任何第三方。"
      ]
    },
    {
      title: "五、Cookie與追蹤技術",
      content: [
        "本系統可能使用 Cookie 或類似技術以提升使用體驗。您可在瀏覽器中設定是否接受 Cookie。"
      ]
    },
    {
      title: "六、用戶權利",
      content: [
        "您有權：",
        "• 查閱、更正或刪除您的個人資料",
        "• 撤回同意或要求停止使用您的資料",
        "• 停用帳戶並刪除所有紀錄（可透過「帳戶設定」申請）"
      ]
    }
  ];

  return (
    <div className="policy-container">
      <h1>私隱政策</h1>
      <p>
        本站會確保所有透過「本草智膳」遞交的個人資料，均嚴格遵守{' '}
        <a
          href="https://www.pcpd.org.hk/tc_chi/data_privacy_law/ordinance_at_a_Glance/ordinance.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          《個人資料（私隱）條例》
        </a>
      </p>

      {sections.map((section, index) => (
        <div key={index}>
          <h2>{section.title}</h2>
          {section.content.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      ))}
    </div>
  );
}

export default PolicyPage;
