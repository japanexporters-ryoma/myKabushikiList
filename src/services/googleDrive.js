/**
 * Google Drive API 連携サービス
 * 
 * スコープ: https://www.googleapis.com/auth/drive.file
 * （アプリ自身が作成したファイル・フォルダのみ読み書き可能。他の個人ファイルには一切触れない安全な権限です）
 */

const FOLDER_NAME = 'myKabushikiList';
const FILE_NAME = 'stocks_data.json';
const DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

// 竜馬さんが取得したGoogle Client IDを設定する場所（ローカルストレージや環境変数からも上書き可能）
export const DEFAULT_CLIENT_ID = localStorage.getItem('google_client_id') || '';

export class GoogleDriveService {
  constructor(clientId) {
    this.clientId = clientId || DEFAULT_CLIENT_ID;
    this.tokenClient = null;
    this.accessToken = null;
    this.folderId = null;
    this.fileId = null;
    this.userProfile = null;
  }

  // Google Identity Services スクリプトの読み込み待機と初期化
  async init(onTokenCallback) {
    return new Promise((resolve) => {
      const checkGsi = () => {
        if (window.google && window.google.accounts && window.google.accounts.oauth2) {
          if (this.clientId) {
            this.tokenClient = window.google.accounts.oauth2.initTokenClient({
              client_id: this.clientId,
              scope: `${DRIVE_FILE_SCOPE} https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email`,
              callback: async (tokenResponse) => {
                if (tokenResponse.error) {
                  console.error('Auth error:', tokenResponse.error);
                  return;
                }
                this.accessToken = tokenResponse.access_token;
                await this.fetchUserProfile();
                if (onTokenCallback) {
                  await onTokenCallback(this.accessToken, this.userProfile);
                }
              },
            });
          }
          resolve(true);
        } else {
          setTimeout(checkGsi, 100);
        }
      };
      checkGsi();
    });
  }

  // クライアントID更新
  setClientId(clientId) {
    this.clientId = clientId;
    localStorage.setItem('google_client_id', clientId);
  }

  // ログインダイアログを開く
  signIn() {
    if (!this.clientId) {
      throw new Error('CLIENT_ID_NOT_SET');
    }
    if (this.tokenClient) {
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    }
  }

  // ユーザープロファイル取得
  async fetchUserProfile() {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      if (res.ok) {
        this.userProfile = await res.json();
      }
    } catch (e) {
      console.warn('Profile fetch error:', e);
    }
  }

  // マイドライブに「myKabushikiList」フォルダを取得または作成
  async getOrCreateFolder() {
    if (this.folderId) return this.folderId;

    // 1. 既存フォルダを検索
    const q = `mimeType='application/vnd.google-apps.folder' and name='${FOLDER_NAME}' and trashed=false and 'root' in parents`;
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      }
    );
    const searchData = await searchRes.json();

    if (searchData.files && searchData.files.length > 0) {
      this.folderId = searchData.files[0].id;
      return this.folderId;
    }

    // 2. なければ新規作成
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
        parents: ['root']
      })
    });
    const folder = await createRes.json();
    this.folderId = folder.id;
    return this.folderId;
  }

  // フォルダ内の stocks_data.json からデータを読み込む
  async loadStocksData() {
    const folderId = await this.getOrCreateFolder();

    // ファイル検索
    const q = `name='${FILE_NAME}' and trashed=false and '${folderId}' in parents`;
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      }
    );
    const searchData = await searchRes.json();

    if (searchData.files && searchData.files.length > 0) {
      this.fileId = searchData.files[0].id;
      // ファイル内容を取得
      const fileRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${this.fileId}?alt=media`,
        {
          headers: { Authorization: `Bearer ${this.accessToken}` }
        }
      );
      if (fileRes.ok) {
        return await fileRes.json();
      }
    }
    return null; // まだファイルがない場合
  }

  // データを Google Drive に保存（新規作成または更新）
  async saveStocksData(stocks) {
    const folderId = await this.getOrCreateFolder();
    const content = JSON.stringify(stocks, null, 2);

    if (this.fileId) {
      // 既存ファイルの更新 (PATCH /upload/drive/v3/files/{fileId}?uploadType=media)
      const res = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${this.fileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: content
        }
      );
      return res.ok;
    } else {
      // 新規ファイル作成（マルチパートアップロード）
      const metadata = {
        name: FILE_NAME,
        parents: [folderId],
        mimeType: 'application/json'
      };

      const boundary = 'foo_bar_baz';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelim = `\r\n--${boundary}--`;

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        content +
        closeDelim;

      const res = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`
          },
          body: multipartRequestBody
        }
      );

      if (res.ok) {
        const file = await res.json();
        this.fileId = file.id;
        return true;
      }
      return false;
    }
  }
}
