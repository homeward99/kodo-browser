export default interface Dictionary {
  // common
  common: {
    kodoBrowser: string,
    empty: string,
    ok: string,
    cancel: string,
    close: string,
    save: string,
    saving: string,
    saved: string,
    submit: string,
    submitting: string,
    submitted: string,
    loading: string,
    success: string,
    failed: string,
    refresh: string,
    interrupt: string,
    notFound: string,
    noOperationalObject: string,
    errored: string,
    downloading: string,
    downloaded: string,
    paused: string,

    directory: string,
    upload: string,
    download: string,
    copy: string,
    move: string,
    paste: string,
    delete: string,
    rename: string,
    more: string,
    extraLink: string,
    extraLinks: string,
    restore: string,
    changeStorageClass: string,
  },

  // top
  top: {
    files: string,
    externalPath: string,
    settings: string,
    bookmarks: string,
    about: string,
    language: string,
    switchUser: string,
    signOut: string,
  },

  // kodo address bar
  kodoAddressBar: {
    goBack: string,
    goForward: string,
    goUp: string,
    refresh: string,
    goHome: string,
    setHome: string,
    setHomeSuccess: string,
    setBookmark: string,
    setBookmarkSuccess: string,
    deleteBookmark: string,
    deleteBookmarkSuccess: string,
  }

  // signIn
  signIn: {
    title: string,
    accessKeyHistory: string,
    form: {
      endpoint: {
        label: string,
        options: {
          public: string,
          private: string,
        }
      },
      accessKeyId: {
        label: string,
        holder: string,
        feedback: {
          required: string,
        },
      },
      accessKeySecret: {
        label: string,
        holder: string,
        feedback: {
          required: string,
        },
      },
      description: {
        label: string,
        holder: string,
        feedback: {
          maxLength: string,
        },
      },
      rememberMe: {
        label: string,
        hint: string,
      },
      submit: string,
      submitting: string,
    },
  },

  signOut: {
    title: string,
  },

  switchUser: {
    title: string,
    error: string,
  },

  // browse
  browse: {
    bucketToolbar: {
      createBucketButton: string,
      moreOperation: {
        toggleButton: string,
        deleteBucketButton: string,
      },
      search: {
        holder: string,
      },
    },
    bucketTable: {
      bucketName: string,
      bucketRegion: string,
      createTime: string,
    }

    fileToolbar: {
      createDirectory: string,
      search: {
        holder: string,
      },
      domain: {
        nonOwnedDomain: string,
        refreshTooltip: string,
      },
    },
    fileTable: {
      fileName: string,
      fileTypeOrSize: string,
      fileStorageClass: string,
      fileModifyDate: string,
      fileOperation: string,
      loadMore: string,
    },
  },

  // transfer
  transfer: {
    jobItem: {
      pauseButton: string,
      startButton: string,
      removeButton: string,
      retryButton: string,
      retryWithOverwriteButton: string,
      status: {
        finished: string,
        failed: string,
        stopped: string,
        waiting: string,
        running: string,
        duplicated: string,
        verifying: string,
      },
      removeConfirmOk: string,
      unknownError: string,
      fileDuplicated: string,
    },
    upload: {
      dropZone: {
        enter: string,
        over: string,
      },
      dialog: {
        title: string,
      },
      hint: {
        addingJobs: string,
        addedJobs: string,
      },
      error: {
        nothing: string,
        duplicatedBasename: string,
      },
      toolbar: {
        search: {
          holder: string,
        },
        emptyDirectorySwitch: string,
        startAllButton: string,
        cleanupButton: string,
        removeAllButton: string,
      },
      removeAllConfirm: {
        title: string,
        content: string,
        ok: string,
        cancel: string,
      },
    },
    download: {
      dialog: {
        title: string,
      },
      hint: {
        addingJobs: string,
        addedJobs: string,
      },
      toolbar: {
        search: {
          holder: string,
        },
        overwriteSwitch: string,
        startAllButton: string,
        cleanupButton: string,
        removeAllButton: string,
      },
      removeAllConfirm: {
        title: string,
        content: string,
        ok: string,
        cancel: string,
      },
    },
  },

  // forms
  forms: {
    changeStorageClass: {
      fileName: {
        label: string,
      },
      currentStorageClass: {
        label: string,
      },
      storageClassKodoName: {
        label: string,
      },
    },
    generateLink: {
      fileName: {
        label: string,
      },
      domainName: {
        label: string,
        nonOwnedDomain: string,
      },
      expireAfter: {
        label: string,
        suffix: string,
      },
      fileLink: {
        label: string,
        copied: string,
      },
    },
    restore: {
      frozen: {
        loading: string,
        normal: string,
        unfreezing: string,
        unfrozen: string,
        unknown: string,
      },
      fileName: {
        label: string,
      },
      days: {
        label: string,
      },
    },
  },

  // modals
  modals: {
    privateCloudSettings: {
      title: string,
      region: string,
      appendRegionButton: string,
      removeRegionButton: string,
      form: {
        ucUrl: {
          label: string,
          holder: string,
          feedback: {
            required: string,
            pattern: string,
          },
        },
        regionIdentifier: {
          label: string,
          holder: string,
          feedback: {
            required: string,
          },
        },
        regionName: {
          label: string,
          holder: string,
        },
        regionEndpoint: {
          label: string,
          holder: string,
          feedback: {
            required: string,
          },
        },
      },
    },
    akHistory: {
      title: string,
      removeAllButton: string,
      activeAkButton: string,
      removeAkButton: string,
      table: {
        endpoint: string,
        accessKeyId: string,
        accessKeySecret: string,
        description: string,
        operation: string,
      },
    },
    releaseNote: {
      title: string,
    },
    settings: {
      title: string,
      saved: string,
      upload: {
        legend: string,
        form: {
          resumeUpload: {
            label: string,
            hint: string,
          },
          multipartUploadThreshold: {
            label: string,
            hint: string,
          },
          multipartUploadPartSize: {
            label: string,
            hint: string,
          },
          maxUploadConcurrency: {
            label: string,
            hint: string,
          },
          enabledUploadSpeedLimit: {
            label: string,
            hint: string,
          },
          uploadSpeedLimit: {
            label: string,
            hint: string,
          },
        },
      },
      download: {
        legend: string,
        form: {
          resumeDownload: {
            label: string,
            hint: string,
          },
          multipartDownloadThreshold: {
            label: string,
            hint: string,
          },
          multipartDownloadPartSize: {
            label: string,
            hint: string,
          },
          maxDownloadConcurrency: {
            label: string,
            hint: string,
          },
          enabledDownloadSpeedLimit: {
            label: string,
            hint: string,
          },
          downloadSpeedLimit: {
            label: string,
            hint: string,
          },
        },
      },
      externalPath: {
        legend: string,
        form: {
          enabled: {
            label: string,
            hint: string
          },
        },
      },
      others: {
        legend: string,
        form: {
          isDebug: {
            label: string,
            hint: string,
          },
          enabledLoadFilesOnTouchEnd: {
            label: string,
            hint: string,
          },
          loadFilesNumberPerPage: {
            label: string,
            hint: string,
          },
          autoUpgrade: {
            label: string,
            hint: string,
          },
          language: {
            label: string,
          },
        },
      },
    },
    bookmarkManager: {
      title: string,
      removeBookmarkButton: string,
      table: {
        url: string,
        createTime: string,
        operation: string,
      }
    },
    externalPathManager: {
      title: string,
      addButton: string,
      removeButton: string,
      error: {
        duplicated: string,
      },
      form: {
        region: {
          label: string,
          feedback: {
            required: string,
          },
        },
        path: {
          label: string,
          holder: string,
          feedback: {
            required: string,
          },
          hint: string,
        },
      },
      table: {
        path: string,
        regionName: string,
        operation: string,
      },
    },
    about: {
      title: string,
      openSourceAddress: string,
      updateApp: {
        checking: string,
        alreadyLatest: string,
        foundLatest: string,
        changeLogsTitle: string,
        operationButton: {
          start: string,
          resume: string,
          pause: string,
          showItemInDir: string,
        },
      },
    },
    createBucket: {
      title: string,
      form: {
        bucketName: {
          label: string,
          holder: string,
          tips: string,
          feedback: {
            required: string,
            pattern: string,
          },
        },
        region: {
          label: string,
          feedback: {
            required: string,
          },
        },
        acl: {
          label: string,
          options: {
            inherit: string,
            publicReadWrite: string,
            publicRead: string,
            private: string,
          },
          feedback: {
            required: string,
          },
        },
      },
    },
    deleteBucket: {
      title: string,
      content: string,
      submit: string,
    },

    createDirectory: {
      title: string,
      form: {
        directoryName: {
          label: string,
          hint: string,
        },
      },
    },

    renameFile: {
      title: string,
      form: {
        baseDirectory: {
          label: string,
        },
        fileName: {
          label: string,
          hint: string,
        },
      },
      replaceConfirm: {
        description: string,
        yes: string,
      },
    },

    deleteFiles: {
      title: string,
      description: string,
    },

    copyFiles: {
      title: string,
      description: string,
      form: {
        fileName: {
          label: string,
          hint: string,
        },
      },
      replaceConfirm: {
        description: string,
        yes: string,
      },
    },

    moveFiles: {
      title: string,
      description: string,
      form: {
        fileName: {
          label: string,
          hint: string,
        },
      },
      replaceConfirm: {
        description: string,
        yes: string,
      },
    },

    changeFilesStorageClass: {
      title: string,
      description: string,
    },

    changeFileStorageClass: {
      title: string,
    },

    restoreFiles: {
      title: string,
      description: string,
    },

    restoreFile: {
      title: string,
    },

    generateFileLinks: {
      title: string,
      description: string,
      csvFile: {
        label: string,
        suffix: string,
      },
      selectLocalPathDialog: {
        title: string,
      },
    },

    generateFileLink: {
      title: string,
    },

    uploadConfirm: {
      title: string,
      previewList: {
        title: string,
        more: string,
      },
      form: {
        isOverwrite: {
          label: string,
          hint: string,
        },
        storageClassKodoName: {
          label: string,
        },
      },
    },

    preview: {
      title: string,
      back: string,
      preCheck: {
        archived: {
          description: string,
          restore: string,
        },
        tooLarge: {
          noPreview: string,
          previewWarning: string,
          forcePreview: string,
        },
      },
      content: {
        code: {
          showDiffView: string,
          saveContent: string,
        },
        others: {
          description: string,
          openAsText: string,
        }
      },
      error: {
        failedGenerateLink: string,
        failedGetContent: string,
        contentNotChanged: string,
      },
    },
    // end modals
  },
}
